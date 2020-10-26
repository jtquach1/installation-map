import os
import json
import subprocess

# Everything ending in .json is in TopoJSON format, and GeoJSON otherwise
FILENAME_TO_COUNTRY = {
    # exploratory.io
    "states.json": "United States of America",
    "canada_provinces.json": "Canada",
    "aus_state.json": "Australia",
    "br_regions.json": "Brazil",
    # Joost Hietbrink
    "provinces.json": "Netherlands",
    # deldersveld
    "algeria-provinces.json": "Algeria",
    "argentina-provinces.json": "Argentina",
    "azerbaijan-regions.json": "Azerbaijan",
    "belgium-provinces.json": "Belgium",
    "chile-regions.json": "Chile",
    "china-provinces.json": "China",
    "colombia-departments.json": "Colombia",
    "czech-republic-regions.json": "Czechia",
    "denmark-counties.json": "Denmark",
    "finland-provinces.json": "Finland",
    "fr-departments.json": "France",
    "germany-regions.json": "Germany",
    "india-states.json": "India",
    "ireland-counties.json": "Ireland",
    "italy-regions.json": "Italy",
    "jp-prefectures.json": "Japan",
    "liberia-counties.json": "Liberia",
    "nepal-zones.json": "Nepal",
    "new-zealand-regional-councils.json": "New Zealand",
    "nigeria-states.json": "Nigeria",
    "norway-counties.json": "Norway",
    "pakistan-provinces.json": "Pakistan",
    "peru-departments-no-illegal-char.json": "Peru",
    "philippines-provinces.json": "Philippines",
    "poland-provinces.json": "Poland",
    "portugal-districts.json": "Portugal",
    "romania-counties.json": "Romania",
    "south-africa-provinces.json": "South Africa",
    "spain-comunidad-with-canary-islands.json": "Spain",
    "sweden-counties.json": "Sweden",
    "turkiye.json": "Turkey",
    "uk-counties.json": "United Kingdom",
    "united-arab-emirates.json": "United Arab Emirates",
    "venezuela-estados.json": "Venezuela",
    # ponentesincausa
    "mexico.json": "Mexico",
}

LINKS = [
    # React Simple Maps
    "https://github.com/zcreativelabs/react-simple-maps/raw/master/topojson-maps/world-110m.json",
    # exploratory.io, may have to download manually
    "https://download2.exploratory.io/maps/states.zip",
    "https://download2.exploratory.io/maps/canada_provinces.zip",
    "https://download2.exploratory.io/maps/aus_states.zip",
    "https://download2.exploratory.io/maps/br_regions.zip",  # not MIT licensed
    # Joost Hietbrink
    "https://www.webuildinternet.com/articles/2015-07-19-geojson-data-of-the-netherlands/provinces.geojson",  # not MIT licensed
    # deldersveld
    "https://github.com/deldersveld/topojson/raw/master/countries/algeria/algeria-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/argentina/argentina-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/azerbaijan/azerbaijan-regions.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/belgium/belgium-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/chile/chile-regions.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/china/china-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/colombia/colombia-departments.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/czech-republic/czech-republic-regions.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/denmark/denmark-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/finland/finland-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/france/fr-departments.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/germany/germany-regions.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/india/india-states.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/ireland/ireland-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/italy/italy-regions.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/japan/jp-prefectures.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/liberia/liberia-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/nepal/nepal-zones.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/new-zealand/new-zealand-regional-councils.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/nigeria/nigeria-states.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/norway/norway-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/pakistan/pakistan-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/peru/peru-departments.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/philippines/philippines-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/poland/poland-provinces.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/portugal/portugal-districts.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/romania/romania-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/spain/spain-comunidad-with-canary-islands.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/sweden/sweden-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/turkey/turkiye.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/united-arab-emirates/united-arab-emirates.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/united-kingdom/uk-counties.json",
    "https://github.com/deldersveld/topojson/raw/master/countries/venezuela/venezuela-estados.json",
    # ponentesincausa
    "https://gist.github.com/ponentesincausa/46d1d9a94ca04a56f93d/raw/a05f4e2b42cf981e31ef9f6f9ee151a060a38c25/mexico.json",  # not MIT licensed
]


# Given ~/installation-map/maps.py and ~/installation-map/maps
REPO_ROOT = "installation-map/"
MAPS = "maps/used/"
BASE_MAP = "world-110m.json"
USA_MAP = "us-albers.json"
PERU_MAP = "peru-departments.json"

HOME_DIR = "%s/" % os.getenv("HOME")
YARN_DIR = "%s.yarn/bin/" % HOME_DIR
MAPS_DIR = "%s%s%s" % (HOME_DIR, REPO_ROOT, MAPS)
BASE_MAP_DIR = "%s%s" % (MAPS_DIR, BASE_MAP)
USA_MAP_DIR = "%s%s" % (MAPS_DIR, USA_MAP)
PERU_MAP_DIR = "%s%s" % (MAPS_DIR, PERU_MAP)
PUBLIC_DIR = "%s%s%s" % (HOME_DIR, REPO_ROOT, "public/")


def remove_old_files(maps_path):
    os.chdir(maps_path)
    print("Removing old .txt, .simple, .merged, and .geojson files")
    os.system("rm *.txt")
    os.system("rm *.simple")
    os.system("rm *.merged")
    os.system("rm *.geojson")


def get_jsons(maps_path, links):
    def is_zip(filename):
        return filename.endswith(".zip")

    os.chdir(maps_path)
    files = os.listdir(maps_path)
    zips = list(filter(is_zip, files))

    # Comment out if TopoJSONs already exist
    # for link in links:
    #     os.system('curl -LJO %s' % link)

    for zipfile in zips:
        os.system("unzip -o %s" % zipfile)

    # Convert downloaded GeoJSON to TopoJSON
    os.system("mv mexico.json mexico.geojson")
    files = os.listdir(maps_path)
    os.system('find . -name "*.geojson" > geojsons.txt')
    f = open("geojsons.txt", "r+")
    geojsons = f.read().splitlines()
    f.close()

    for input_geojson in geojsons:
        temp = input_geojson.split("/")
        last = len(temp) - 1
        filename = temp[last]
        temp = filename.split(".")
        last = len(temp) - 1
        prefix = temp[last - 1]
        output_topojson = "%s.json" % prefix
        convert_geo2topo(maps_path, input_geojson, output_topojson)


def remove_peru_objects_illegal_char(peru_map_path):
    prefix = peru_map_path.split(".")[0]
    output_file = "%s-no-illegal-char.json" % prefix
    peru_map = json.load(open(peru_map_path))
    old_key = "peru-departments'"
    new_key = "peru-departments"
    peru_map["objects"][new_key] = peru_map["objects"].pop(old_key)
    with open(output_file, "w") as outfile:
        json.dump(peru_map, outfile)


def create_filelist(path, filename_map):
    def is_json(filename):
        return filename.endswith(".json")

    def in_filename_map(filename):
        return filename in filename_map

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
        base_map["objects"]["ne_110m_admin_0_countries"][
            "geometries"
        ] = overwrite_countries_arcs(geometries, names)
        return base_map

    # Open base map and remove countries who will be replaced with their states
    updated_base_map = update_geometries()

    # Write 2 copies of template file for detailed maps with and without states
    prefix = base_map_path.split(".")[0]
    with open("%s.simple" % prefix, "w") as outfile:
        json.dump(updated_base_map, outfile)
    os.system("cp %s.simple %s.merged" % (prefix, prefix))


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
        return geometry["properties"]["NAME"]

    def empty_geometry_arcs(geometry):
        given_name = get_country_name(geometry)
        if given_name in names:
            geometry["arcs"].clear()
        return geometry

    updated_geometries = list(map(empty_geometry_arcs, geometries))
    return updated_geometries


def simplify_topojsons(maps_path, filelist, filename_map):
    os.chdir(maps_path)
    toposimplify = "%stoposimplify" % YARN_DIR

    for input_file in filelist:
        if not input_file in filename_map.keys():
            continue
        else:
            prefix = input_file.split(".")[0]
            output_file = prefix + ".simple"
            threshold = 0.27
            os.system(
                "%s -o %s -P %f %s" % (toposimplify, output_file, threshold, input_file)
            )


def merge_topojson_states(maps_path, filelist, filename_map):
    os.chdir(maps_path)
    topomerge = "%stopomerge" % YARN_DIR

    for input_file in filelist:
        prefix = input_file.split(".")[0]
        if not input_file in filename_map.keys():
            continue
        else:
            simple = prefix + ".simple"
            output_file = prefix + ".merged"
            input_map = json.load(open(simple))
            source_object = list(input_map["objects"].keys())[0]
            os.system(
                "%s %s=%s -o %s %s"
                % (topomerge, source_object, source_object, output_file, simple)
            )


def convert_topo2geo(maps_path, filelist, input_suffix):
    os.chdir(maps_path)
    topo2geo = "%stopo2geo" % YARN_DIR
    filelist.append(BASE_MAP)
    os.system("> objects.txt")

    # Get list of all simplified topojsons with their objects
    for f in filelist:
        prefix = f.split(".")[0]
        input_file = "%s%s" % (prefix, input_suffix)
        command = "%s -l -i %s >> objects.txt" % (topo2geo, input_file)
        os.system(command)

    # Since files must end with a newline in UNIX, the last element is empty.
    # So, we must remove it, or else we zip through lists of uneven length.
    f = open("objects.txt", "r+")
    objects = f.read().split("\n")[:-1]
    f.close()

    for object, f in zip(objects, filelist):
        prefix = f.split(".")[0]
        input_file = "%s%s" % (prefix, input_suffix)
        output_file = "%s.geojson" % input_file
        command = "%s %s=%s < %s" % (topo2geo, object, output_file, input_file)
        os.system(command)


def merge_geojsons(maps_path, output_geojson, input_suffix):
    os.chdir(maps_path)
    input_files = "*%s.geojson" % input_suffix
    geojson_merge = "%sgeojson-merge" % YARN_DIR
    command = "%s %s > %s" % (geojson_merge, input_files, output_geojson)
    os.system(command)


def convert_geo2topo(maps_path, input_geojson, output_topojson):
    os.chdir(maps_path)
    geo2topo = "%sgeo2topo" % YARN_DIR
    command = "%s features=%s > %s" % (geo2topo, input_geojson, output_topojson)
    os.system(command)


def deploy_to_public(maps_path, input_topojson, public_path):
    os.chdir(maps_path)
    os.system("cp %s %s" % (input_topojson, public_path))


def main():
    # GeoJSON = intermediate output
    states_geojson = "detailed-with-states.geojson"
    borders_geojson = "detailed-no-states.geojson"

    # TopoJSON = final output
    states_topojson = "detailed-with-states.topojson"
    borders_topojson = "detailed-no-states.topojson"

    # Remove all files from previous run
    remove_old_files(MAPS_DIR)

    # Get JSONs for processing, will need to convert some GeoJSONs to TopoJSON
    # get_jsons(MAPS_DIR, LINKS)

    # Remove illegal single quote from Peru objects name
    remove_peru_objects_illegal_char(PERU_MAP_DIR)

    # Create filelist to use in creating combined map
    filelist = create_filelist(MAPS_DIR, FILENAME_TO_COUNTRY)

    # Replace countries by their states if states exist
    create_template_file(BASE_MAP_DIR, filelist, FILENAME_TO_COUNTRY)

    # Simplify TopoJSONs for merging
    simplify_topojsons(MAPS_DIR, filelist, FILENAME_TO_COUNTRY)

    # Merge TopoJSON states to make countries with better borders
    merge_topojson_states(MAPS_DIR, filelist, FILENAME_TO_COUNTRY)

    # Convert TopoJSONs to GeoJSONs
    convert_topo2geo(MAPS_DIR, filelist, ".simple")
    convert_topo2geo(MAPS_DIR, filelist, ".merged")

    # Merge all GeoJSONs into 1
    merge_geojsons(MAPS_DIR, states_geojson, ".simple")
    merge_geojsons(MAPS_DIR, borders_geojson, ".merged")

    # Convert GeoJSON back to TopoJSON
    convert_geo2topo(MAPS_DIR, states_geojson, states_topojson)
    convert_geo2topo(MAPS_DIR, borders_geojson, borders_topojson)

    # Copy the final TopoJSONs into the public folder
    deploy_to_public(MAPS_DIR, states_topojson, PUBLIC_DIR)
    deploy_to_public(MAPS_DIR, borders_topojson, PUBLIC_DIR)
    deploy_to_public(MAPS_DIR, BASE_MAP, PUBLIC_DIR)


if __name__ == "__main__":
    main()
