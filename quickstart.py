from __future__ import print_function
import pickle
import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import sys
import googlemaps
from datetime import datetime
import json

### Google Sheets API ###
# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# The ID and range of a spreadsheet.
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SHEET_NAME = os.getenv('SHEET_NAME')
UPDATED_SHEET_NAME = os.getenv('UPDATED_SHEET_NAME')
LEFT_COL = os.getenv('LEFT_COL')
RIGHT_COL = os.getenv('RIGHT_COL')

### Geocoding API ###
GEOCODING_API_KEY = os.getenv('GEOCODING_API_KEY')

# Make output file in static dir after doing `yarn build`
WAYPOINTS = '%s/waypoints.json' % os.getenv('STATIC_DIR')


def create_waypoints(input_sheet):
    """
    If input_sheet already exists, then it will be updated with all valid rows 
    following the last stored entry. Otherwise, input_sheet will be created 
    with all rows in the Google Sheet.  
    """
    rows = extract_rows(input_sheet)
    try:
        final = json.load(open(input_sheet))
        if not rows:
            print('No data found! Either the Google Sheet is empty, or has ' +
                  'not been updated since the last time this script was ' +
                  'run.')
        else:
            print('Updating "' + input_sheet + '" following the last ' +
                  'successful row. The Google Sheet also may have been ' +
                  'updated since the last time this script was run.')
    except FileNotFoundError:
        print('File "' + input_sheet + '" does not already exist. Creating.')
        final = []
    finally:
        keys = extract_keys()
        filtered = list(filter(lambda row: is_successful(row, keys), rows))
        mapped = list(map(lambda row: create_waypoint(row, keys), filtered))
        final += mapped
        out_file = open(input_sheet, 'w')
        json.dump(final, out_file)
        out_file.close()
        print('Successfully geocoded valid rows in "' + input_sheet + '".')


def extract_rows(input_sheet):
    """
    Gets an array of arrays rows that follow the last successful row stored in 
    input_sheet, from the 1-indexed Google Sheet.
    """
    row_num = next_row_number(input_sheet)
    range_name = extract_range_name(row_num, None)
    rows = extract_values(SCOPES, SPREADSHEET_ID, range_name)
    if rows:
        for i, row in enumerate(rows, start=row_num):
            row.append(i)
    return rows


def extract_keys():
    """
    Gets an array keys, which is the first row in the 1-indexed Google Sheet.
    """
    range_name = extract_range_name(1, 1)
    keys = extract_values(SCOPES, SPREADSHEET_ID, range_name)[0]
    keys.append('index')
    return keys


def is_successful(row, keys):
    """
    Checks whether an array row designates a successful installation, based on
    the values corresponding to the column headers.
    """
    i = keys.index('Have you already tried to deploy (install) cBioPortal?')
    j = keys.index('Success?')
    try:
        successful = row[i] != 'Not yet' and row[j] == 'Yes'
    except IndexError:
        successful = false
    finally:
        return successful


def create_waypoint(row, keys):
    """
    Given a geocode_result array, header keys, and row array, this creates a
    dictionary waypoint.
    """
    city = row[keys.index('City')]
    state = row[keys.index('State / Province')]
    country = row[keys.index('Country')]
    geocode_result = extract_geocode_result(city, state, country)
    waypoint = convert_array_to_dict(keys, row)
    waypoint = add_coordinates_and_address(geocode_result, waypoint)
    waypoint = remove_extraneous_columns(waypoint)
    waypoint = rename_keys(waypoint)
    return waypoint


def next_row_number(input_sheet):
    """
    Gets the 1-indexed Google Sheet row number of the row following the last 
    successful row from input_sheet, which consists of an array of waypoint 
    objects. If input_sheet doesn't already exist, then row_num refers to the 
    row following the keys of the Google Sheet. 
    """
    try:
        f = open(input_sheet)
        data = json.load(f)
        last = len(data) - 1
        row_num = data[last]['index'] + 1
    except FileNotFoundError:
        row_num = 2
    finally:
        return row_num


def extract_range_name(left_row_num, right_row_num):
    """
    Gets the range_name for making a Geocoding API spreadsheets.values.get 
    call. If right_row_num is not an int, then the returned range_name will
    indicate the entire Google Sheet beyond left_row_num. 
    """
    # change SHEET_NAME to UPDATED_SHEET_NAME to test updating functionality
    # SHEET_NAME = UPDATED_SHEET_NAME
    try:
        range_name = '%s!%s%d:%s%d' % (
            SHEET_NAME, LEFT_COL, left_row_num, RIGHT_COL, right_row_num)
    except TypeError:
        range_name = '%s!%s%d:%s' % (
            SHEET_NAME, LEFT_COL, left_row_num, RIGHT_COL)
    finally:
        return range_name


def extract_values(scopes, spreadsheet_id, range_name):
    """
    Adapted from the Google Sheets Python Quickstart guide at 
    https://developers.google.com/sheets/api/quickstart/python.
    Reads a spreadsheet and returns an array corresponding to a given range.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', scopes)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=spreadsheet_id,
                                range=range_name).execute()
    values = result.get('values', [])
    return values


def extract_geocode_result(city, state, country):
    """
    Tries to get a geocode_result array from 3 address strings,
    depending on whether a valid geocode_result was returned. 
    Otherwise, an empty array is returned.
    """
    gmaps = googlemaps.Client(key=GEOCODING_API_KEY)
    geocode_result = gmaps.geocode('%s %s %s' % (city, state, country))
    if not geocode_result:
        geocode_result = gmaps.geocode('%s %s' % (state, country))
    if not geocode_result:
        geocode_result = gmaps.geocode(country)
    return geocode_result


def convert_array_to_dict(keys, row):
    """
    Converts an array row to a dictionary based on the header keys, and returns
    the dictionary.
    """
    newRow = {}
    for i, col in enumerate(row):
        newRow[keys[i]] = col
    return newRow


def add_coordinates_and_address(geocode_result, row):
    """
    Returns a dictionary row that contains the coordinates and address keys.
    """
    formatted_address = geocode_result[0]['formatted_address']
    location = geocode_result[0]['geometry']['location']
    lat = location['lat']
    lng = location['lng']
    coordinates = [lng, lat]
    row['coordinates'] = coordinates
    row['address'] = formatted_address
    return row


def remove_extraneous_columns(row):
    """
    Returns a dictionary row without certain columns, as such data will be 
    unused. 
    """
    # Some rows don't contain the "Success" entry.
    row.pop('Success?', None)
    row.pop('Have you already tried to deploy (install) cBioPortal?')
    row.pop('City')
    row.pop('State / Province')
    row.pop('Country')
    return row


def rename_keys(row):
    """
    Given a dictionary row, remove certain columns and add back the same data
    under different keys.
    """
    row['institution'] = row.pop('Institution or Company Name')
    row['category'] = row.pop('Category')
    row['lab'] = row.pop('Lab / Group')
    return row


def main():
    """
    Gets specified columns from a Google Sheet, geocodes addresses to 
    (lng, lat) coordinates, and produces a waypoints JSON file.
    """
    create_waypoints(WAYPOINTS)


if __name__ == '__main__':
    main()
