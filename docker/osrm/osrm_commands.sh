#!/bin/sh
# osrm-extract -p /opt/car.lua /data/languedoc-roussillon.osm.pbf
# osrm-partition /data/languedoc-roussillon.osm.pbf
# osrm-customize /data/languedoc-roussillon.osm.pbf
# osrm-routed --algorithm mld /data/languedoc-roussillon.osrm

osrm-extract -p /opt/car.lua /data/input.pbf
osrm-partition /data/input
osrm-customize /data/input
osrm-routed --algorithm mld /data/input

exec "$@"