import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Activityindicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { LocationAccuracy } from 'expo-location';
import { Header } from 'react-native/Libraries/NewAppScreen';

const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=GEN,cases7_per_100k&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const apiUrlStates = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=cases7_bl_per_100k&returnGeometry=false&outSR=4326&f=json'

export default function App() {
  const [location, setLocation] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  useEffect(() => {
    async function getLocation() {
      console.log('requesting permissions');
      let status = await Location.requestPermissionsAsync();
      console.log(status);
      let location = await Location.getCurrentPositionAsync({ accuracy : LocationAccuracy.Low });
      setLocation(location);
      if(location) {
        console.log('Getting data from RKI');
        console.log(apiUrl(location.coords));
        try {
        let response = await fetch(apiUrl(location.coords));
        let json = await response.json();
        var data = { area: json.features[0].attributes.GEN, incidence: json.features[0].attributes.cases7_per_100k.toFixed(1) };
        setData(data);
        } catch(error) {
          console.log(error);
        }
      }
    }
    getLocation();
  }, []);
  useEffect(() => {
    if(locationPermission) {
      console.log('Getting location');
    }
  }, [locationPermission]);
  let area = 'Waiting..';
  let incidence = 'Waiting..'
  if(errorMsg) {
    text = errorMsg;
  } else if (data) {
    area = data.area;
    incidence = data.incidence;
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity>
      <View style={styles.box}>
        <Text style={styles.header}>🦠 INZIDENZ</Text>
        <Text style={styles.area}>{area}</Text>
        <Text style={(data.incidence >= 50.) ? styles.red : styles.green}>{incidence}</Text>
        <StatusBar style="auto" />
      </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: 'dimgray',
    width: 150,
    height: 150,
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.46,
    shadowRadius: 25,
    elevation: 17
  },
  header: {
    fontSize: 18,
    height: 'auto',
    width: 'auto',
    color: 'white'
  },
  area: {
      fontSize: 18,
      alignSelf: 'center',
      paddingTop: 15,
      color: 'white'
  },
  green: {
    color: 'chartreuse',
    fontSize: 24,
    alignSelf: 'center',
    padding: 15
  },
  red: {
    color: 'crimson',
    fontSize: 24,
    alignSelf: 'center',
    padding: 15,
    fontWeight: 'bold'
  }
});
