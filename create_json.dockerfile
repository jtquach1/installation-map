# Create waypoints.json.
FROM ubuntu:18.04
RUN apt-get --yes update
RUN apt-get --yes install python3-pip
RUN pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
RUN pip3 install -U googlemaps

ENV SPREADSHEET_ID=***REMOVED*** \
  SHEET_NAME=Form\ Responses\ 1 \
  UPDATED_SHEET_NAME=Updated\ Form\ Responses\ 1 \
  LEFT_COL=E \
  RIGHT_COL=L \
  GEOCODING_API_KEY=***REMOVED*** \
  STATIC_DIR=/app/src

WORKDIR /app
COPY quickstart.py ./
COPY credentials.json ./
COPY token.pickle ./
RUN mkdir src
COPY src/waypoints.json ./src
RUN python3 quickstart.py
