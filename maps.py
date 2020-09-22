import os
import sys
import json
import subprocess
from functools import reduce

# Assume everything ending in .json is in TopoJSON format, and GeoJSON otherwise
FILENAME_TO_COUNTRY = {
    'nl-gemeentegrenzen-2016.json': 'Netherlands',
    'india-states.json': 'India',
    'uk-counties.json': 'United Kingdom',
    'us-albers-no-HI-AL.json': 'United States of America',
    'germany-regions.json': 'Germany',
    'liberia-counties.json': 'Liberia',
    'sweden-counties.json': 'Sweden',
    'fr-departments.json': 'France',
    'pakistan-provinces.json': 'Pakistan',
    'mx-states.json': 'Mexico',
    'new-zealand-regional-councils.json': 'New Zealand',
    'norway-counties.json': 'Norway',
    'algeria-provinces.json': 'Algeria',
    'turkiye.json': 'Turkey',
    'italy-regions.json': 'Italy',
    'denmark-counties.json': 'Denmark',
    'venezuela-estados.json': 'Venezuela',
    'belgium-provinces.json': 'Belgium',
    'argentina-provinces.json': 'Argentina',
    'spain-comunidad-with-canary-islands.json': 'Spain',
    'czech-republic-regions.json': 'Czechia',
    'china-provinces.json': 'China',
    'colombia-departments.json': 'Colombia',
    'chile-regions.json': 'Chile',
    'philippines-provinces.json': 'Philippines',
    'nepal-zones.json': 'Nepal',
    'azerbaijan-regions.json': 'Azerbaijan',
    'canada_provinces.json': 'Canada',
    'portugal-districts.json': 'Portugal',
    'ireland-counties.json': 'Ireland',
    'united-arab-emirates.json': 'United Arab Emirates',
    'romania-counties.json': 'Romania',
    'finland-provinces.json': 'Finland',
    'jp-prefectures.json': 'Japan',
    'peru-departments-no-illegal-char.json': 'Peru',
    'south-africa-provinces.json': 'South Africa',
    'nigeria-states.json': 'Nigeria',
    'poland-provinces.json': 'Poland'
}


# Given ~/installation-map/maps.py and ~/installation-map/maps
REPO_ROOT = 'installation-map/'
MAPS = "maps/used/"
BASE_MAP = 'world-110m.json'
USA_MAP = 'us-albers.json'
PERU_MAP = 'peru-departments.json'

HOME_DIR = '%s/' % os.getenv('HOME')
YARN_DIR = '%s.yarn/bin/' % HOME_DIR
MAPS_DIR = '%s%s%s' % (HOME_DIR, REPO_ROOT, MAPS)
BASE_MAP_DIR = '%s%s' % (MAPS_DIR, BASE_MAP)
USA_MAP_DIR = '%s%s' % (MAPS_DIR, USA_MAP)
PERU_MAP_DIR = '%s%s' % (MAPS_DIR, PERU_MAP)
PUBLIC_DIR = '%s%s%s' % (HOME_DIR, REPO_ROOT, 'public/')


def remove_old_files(maps_path):
    os.chdir(maps_path)
    print('Removing old .simple and .geojson files')
    os.system('rm *.simple')
    os.system('rm *.geojson')


def remove_hawaii_and_alaska(usa_maps_path):
    def can_keep_state(geometry):
        countries_to_remove = ['Hawaii', 'Alaska']
        is_removable = geometry['properties']['name'] in countries_to_remove
        return not is_removable

    prefix = usa_maps_path.split(".")[0]
    output_file = '%s-no-HI-AL.json' % prefix
    usa_map = json.load(open(usa_maps_path))
    geometries = usa_map['objects']['us']['geometries']
    updated_geometries = list(filter(can_keep_state, geometries))
    usa_map['objects']['us']['geometries'] = updated_geometries
    with open(output_file, "w") as outfile:
        json.dump(usa_map, outfile)


def remove_peru_objects_illegal_char(peru_map_path):
    prefix = peru_map_path.split(".")[0]
    output_file = '%s-no-illegal-char.json' % prefix
    peru_map = json.load(open(peru_map_path))
    old_key = "peru-departments'"
    new_key = 'peru-departments'
    peru_map['objects'][new_key] = peru_map['objects'].pop(old_key)
    with open(output_file, "w") as outfile:
        json.dump(peru_map, outfile)


def create_filelist(path, filename_map):
    def is_json(file):
        return file.endswith('.json')

    def in_filename_map(file):
        return file in filename_map

    files = os.listdir(path)
    filelist = list(filter(is_json, files))
    filelist = list(filter(in_filename_map, filelist))
    return filelist


def create_template_file(base_map_path, filelist, filename_map):
    def get_geometries(base_map):
        geometries = base_map["objects"]["ne_110m_admin_0_countries"]["geometries"]
        return geometries

    def update_geometries():
        base_map = json.load(open(base_map_path))
        geometries = get_geometries(base_map)
        names = get_countries_with_states(filelist, filename_map)
        base_map["objects"]["ne_110m_admin_0_countries"]["geometries"] = overwrite_countries_arcs(
            geometries, names)
        return base_map

    # Open base map and remove countries who will be replaced with their states
    updated_base_map = update_geometries()

    # write template file
    prefix = base_map_path.split(".")[0]
    with open('%s.simple' % prefix, "w") as outfile:
        json.dump(updated_base_map, outfile)


def get_countries_with_states(filelist, filename_map):
    def country_has_states(input_file):
        return input_file in filename_map

    def get_real_name(input_file):
        return filename_map[input_file]

    filtered_filelist = list(filter(country_has_states, filelist))
    countries_with_states = list(map(get_real_name, filtered_filelist))
    return countries_with_states


def overwrite_countries_arcs(geometries, names):
    def get_country_name(geometry):
        return geometry['properties']['NAME']

    def empty_geometry_arcs(geometry):
        given_name = get_country_name(geometry)
        if given_name in names:
            geometry["arcs"].clear()
        return geometry

    updated_geometries = list(map(empty_geometry_arcs, geometries))
    return updated_geometries


def simplify_topojsons(maps_path, filelist, filename_map):
    os.chdir(maps_path)
    toposimplify = '%stoposimplify' % YARN_DIR

    for input_file in filelist:
        if not input_file in filename_map.keys():
            continue
        else:
            prefix = input_file.split(".")[0]
            output_file = prefix + '.simple'
            threshold = 0.27
            os.system('%s -o %s -P %f %s' %
                      (toposimplify, output_file, threshold, input_file))


def convert_topo2geo(maps_path, filelist):
    def byte_string_to_string(line):
        return line.decode('utf-8').split("\n")[0]

    os.chdir(maps_path)
    topo2geo = '%stopo2geo' % YARN_DIR
    output = []
    filelist.append(BASE_MAP)

    # get list of all simplified topojsons with their objects
    for f in filelist:
        input_file = f.split(".")[0] + '.simple'

        # capture standard output to a list
        command = '%s -l < %s' % (topo2geo, input_file)
        output.append(subprocess.check_output(command, shell=True))

    converted = list(map(byte_string_to_string, output))
    for object, f in zip(converted, filelist):
        prefix = f.split(".")[0]
        input_file = prefix + '.simple'
        output_file = prefix + '.geojson'
        command = '%s %s=%s < %s' % (topo2geo, object, output_file, input_file)
        os.system(command)


def merge_geojsons(maps_path, output_geojson):
    os.chdir(maps_path)
    input_files = '*.geojson'
    geojson_merge = '%sgeojson-merge' % YARN_DIR
    command = '%s %s > %s' % (geojson_merge, input_files, output_geojson)
    os.system(command)


def convert_geo2topo(maps_path, input_geojson, output_topojson):
    os.chdir(maps_path)
    geo2topo = '%sgeo2topo' % YARN_DIR
    command = '%s features=%s > %s' % (
        geo2topo, input_geojson, output_topojson)
    os.system(command)


def deploy_to_public(maps_path, input_topojson, public_path):
    os.chdir(maps_path)
    os.system('mv %s %s' % (input_topojson, public_path))


def main():
    # GeoJSON = intermediate output
    geojson = 'combined.geojson'

    # TopoJSON = final output
    topojson = 'combined.topojson'

    # Remove all files from previous run
    remove_old_files(MAPS_DIR)

    # Remove Hawaii and Alaska from USA
    remove_hawaii_and_alaska(USA_MAP_DIR)

    # Remove illegal single quote from Peru objects name
    remove_peru_objects_illegal_char(PERU_MAP_DIR)

    # Create filelist to use in creating combined map
    filelist = create_filelist(MAPS_DIR, FILENAME_TO_COUNTRY)

    # Replace countries by their states if states exist
    create_template_file(BASE_MAP_DIR, filelist, FILENAME_TO_COUNTRY)

    # Simplify TopoJSONs for merging
    simplify_topojsons(MAPS_DIR, filelist, FILENAME_TO_COUNTRY)

    # Convert TopoJSONs to GeoJSONs
    convert_topo2geo(MAPS_DIR, filelist)

    # Merge all GeoJSONs into 1
    merge_geojsons(MAPS_DIR, geojson)

    # Convert GeoJSON back to TopoJSON
    convert_geo2topo(MAPS_DIR, geojson, topojson)

    # Copy the final TopoJSON into the public folder
    deploy_to_public(MAPS_DIR, topojson, PUBLIC_DIR)


if __name__ == '__main__':
    main()
