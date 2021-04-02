import React ,{useState , useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  Platform,
  PermissionsAndroid,
  View,
  TouchableOpacity
} from 'react-native';

import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

import { RNVoiceRecorder } from 'react-native-voice-recorder';




const App = () =>{
  let data = []
  const [path,setpath]= useState(null)
  const [recordes,setrecordes]= useState([])
  const per  = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permissions for write access',
            message: 'Give permission to your storage to write a file',
            buttonPositive: 'ok',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the storage');
        } else {
          console.log('permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permissions for write access',
            message: 'Give permission to your storage to write a file',
            buttonPositive: 'ok',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
        } else {
          console.log('permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }


    check(PERMISSIONS.ANDROID.RECORD_AUDIO)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('This feature is not available (on this device / in this context)');
          break;
        case RESULTS.DENIED:
          console.log('The permission has not been requested / is denied but requestable');
          break;
        case RESULTS.LIMITED:
          console.log('The permission is limited: some actions are possible');
          break;
        case RESULTS.GRANTED:
          console.log('The permission is granted');
          break;
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore');
          break;
      }

    })
    .catch((error) => {
        // …
    });

  }
  

   const onStartRecord = async () => {

    // /storage/emulated/0/recorded_audio.wav
    RNVoiceRecorder.Record({
      path:"/storage/emulated/"+ Math.random()+".wav",
      onDone: (path) => {
       path= "/storage/emulated/0/recorded_audioo.wav"
      //  path= "/storage/emulated/"+ Math.random()+".wav"
      //  path=  Math.random()+".wav"
      console.log("pathhhh==>" , path)
      let temp = [...recordes]
      temp.push(path)
      setrecordes(temp)
      },
      onCancel: () => {
      console.log("cancle")
      }
  })

  };
  

  const  onStartPlay = async (path) => {
    console.log("play pathhhh from function==>" , path)
    RNVoiceRecorder.Play({
      path: path,
      onDone: (path) => {
        console.log("play pathhhh==>" , path)
      },
      onCancel: () => {
        console.log("cancle play")
      }
  })
    };
  
  useEffect(()=>{
   console.log("recordes==>" , recordes)
  // console.log("data==>" , data)
  },[recordes])

  useEffect(()=>{
    per()
  },[])


  return (
 <View style={{justifyContent:"center" , alignItems:"center" , paddingTop:200}}>

         <View style={styles.row}>
        <TouchableOpacity style={styles.touchable} onPress={()=>onStartRecord()}>
        <Text style={styles.text}> Start Record</Text>
        </TouchableOpacity>
        </View>

          <FlatList
          data={recordes}
          style={{}}
          renderItem={({item,index})=>{
            return(
              <TouchableOpacity style={[styles.touchable , {marginVertical:5}]} onPress={()=>onStartPlay(item)}>
              <Text style={styles.text}> Play Record {index}</Text>
              </TouchableOpacity>
            )
          }}
          />

      

      

 </View>
  );
};


const styles = StyleSheet.create({
  row:{
flexDirection:"row" ,
paddingHorizontal:50,
marginVertical:50,
//backgroundColor:"red"
  },
  touchable:{
justifyContent:"center" ,
alignItems:"center",
padding:10,
borderRadius:8,
backgroundColor:"blue",
marginHorizontal:20, 
elevation:3
  },
  text:{
    fontSize:14,
    color:"#fff"
  }
})
export default App;
