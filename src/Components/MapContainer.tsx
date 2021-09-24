import * as React from "react";
import {Feature, Geometry, FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import { geoEqualEarth, geoOrthographic, geoPath } from "d3-geo";
import '../Style/App.css';
import { Boat, Trip, TripPoint } from "../Boat";

const uuid = require('react-uuid');

const scale: number = 200;
const cx: number = 400;
const cy: number = 150;



const MapContainer  = (props: {boats: Boat[]})  => {
    const {boats} = props;
    const [geographies, setGeographies] = React.useState<[] | Array<Feature<Geometry | null>>>([]);
    const trips: Trip[] = [];

    React.useEffect(() => {
        fetch('/data/world.json').then((response) => {
            if(response.status !== 200) {
                console.log("error" + response.status);
                return;
            }

            response.json().then((worldData) => {
                const mapFeature: Array<Feature<Geometry | null>> = ((feature(worldData, worldData.objects.countries) as unknown) as FeatureCollection).features;
                setGeographies(mapFeature);
            })
        })
    }, []);

    const projection = geoEqualEarth().scale(scale).translate([cx, cy]).rotate([0,0]);
    boats.forEach( e => {
      console.log(e.ballastTrip.points.length);
        trips.push(e.ballastTrip);
        trips.push(e.ladenTrip);
    });

    function pathOfTrip(trip: Trip) {
      const projectedPoints: [number, number][] = [];
      trip.points.forEach((point) => {
        const projectedPoint = projection([point.long, point.lat])!;
        projectedPoints.push(projectedPoint);
      });

      const pathData = projectedPoints.map((p, i)=> {
        if(i == 0)
          return `M ${p[0]} ${p[1]}`;
        else
          return `L ${p[0]} ${p[1]}`;
      }).join(" ");

      return (
        <path key={`path-${uuid()}`}
          d={pathData}
          stroke="red"
          fill="none"
          strokeWidth={1}
          />
      );
    }

    return (
        <div className={"Container"} id={"map"}>
            <svg width={scale*3} height={scale*3} viewBox="0 0 800 450">
                <g>
                    {(geographies as []).map((d, i) => (
                        <path key={`path-${uuid()}`} 
                        d={geoPath().projection(projection)(d) as string}
                        fill={`rgba(38,50,56,${(1/ (geographies ? geographies.length : 0)) * i})`}
                        stroke="aliceblue"
                        strokeWidth={0.5}
                        />
                    ))}
                </g>
                <g>
                  {trips.map((d) => pathOfTrip(d))}
                </g>
            </svg>
        </div>
    );
}

export default MapContainer