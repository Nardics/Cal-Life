#  Objectives - Cal-Life
This project looks at the number of births and deaths in forty-five of the fifty-eight California counties. The period spans 2010-2019. Data scope was limited to incorporated places with a population of 50,000 or more.

## Target Audience

The map would be useful to individuals in population planning, economic planning and resource allocation. Usage may also include establishing trends in mortality. The map may attract the attention of the casual user, who is interested in trends in mortality.

## User Experience
The map has a simple user interface comprising of a zoom control, and a slider element . These allow users to zoom to various levels as well as observe changes in events over the established time period.

## Data Sources
Vital statistics and county shapefiles were obtained in CSV format from the U.S. Census Bureau website- https://www.census.gov/data/tables/time-series/demo/popest/2010s-total-cities-and-towns.html  and http://www2.census.gov/geo/tiger/GENZ2014/shp/cb_2014_06_county_within_ua_500k.zip.

## Methodology
This vital statistics data was downloaded in csv format, where fields were culled and edited in MS Excel to produce the resultant table used in the mapping process. 
The US county boundaries files was accessed in QGIS where the California counties were filtered and exported as a geojson. This was then uploaded to Mapbox and overlaid on the basemap.



## Technology Stack
MS Excel - process CSV data to cull unrequired columns and redundant data within fields.
QGIS was used to extract the California county boundaries from the original files.
Visual Studio Code- used to encode data.
Mapbox- used a a basemap host.
Leaflet and jQuery plugins for javascript have been retained to aid in the building of the website.

