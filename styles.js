import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
  principale: {
    marginTop: 22,
    backgroundColor:"red",
  },
  monitor: {
    backgroundColor:"black",
    flex: 0.5,
    width: 500,
    height: 40,
  },
  basso: {
    flex : 1,
    flexDirection: 'column-reverse',
  },
    container: {
      flex: 0.9,
      backgroundColor: '#F5FCFF'
    },
    iconImage: {
      width: 25,
      height: 25
    },
    topBar: {
      height: 56,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 6,
      backgroundColor: '#004c8b'
    },
    heading: {
      fontWeight: 'bold',
      fontSize: 16,
      alignSelf: 'center',
      color: '#FFFFFF',
      width: '50%'
    },
    enableInfoWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    tab: {
      alignItems: 'center',
      flex: 0.5,
      height: 56,
      justifyContent: 'center',
      borderBottomWidth: 6,
      borderColor: 'transparent'
    },
    connectionInfoWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 25
    },
    connectionInfo: {
      fontWeight: 'bold',
      alignSelf: 'center',
      fontSize: 18,
      marginVertical: 10,
      color: '#238923'
    },
    devicesList: {
      height: '80%'
    },
    deviceRow: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center'
    },
    deviceName: {
      fontWeight: 'bold',
      width: '50%'
    },
    deviceId: {
      color: '#777777'
    },
    listItem: {
      flex: 1,
      height: 48,
      paddingHorizontal: 16,
      borderColor: '#ccc',
      borderBottomWidth: 0.5,
      justifyContent: 'center'
    },
    fixedFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#ddd'
    },
    MaterialButton: {
      height: '5%',
      margin: 5,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center'
    },
    MaterialButtonText: {
      color: '#004c8b',
      fontWeight: 'bold',
      fontSize: 14,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    MaterialButtonRaised: {
      backgroundColor: '#7B1FA2',
      borderRadius: 2,
      elevation: 2
    },
  
    // Joystick styles
    padContainer: {
      backgroundColor: '#fff',
      flex: 1, 
      flexDirection: 'row',
      alignContent: "center",
      
    },
    boxContainer: {
      flexDirection: 'row'
    },
    box: {
      width: '50%',
      fontSize: 10,
      backgroundColor: '#eee',
      justifyContent: "space-between"
    },
  
    buttonContainer: {
      
      marginVertical: 10,
      flexDirection: "row"
    },

    actionButton: {
      flexDirection: 'column',
     flex:1,
      marginHorizontal: 10,
      
      justifyContent: "space-between"
    },
                                          
    topBarButton: {
        marginLeft: 30
    },

    wifiModal: {
      backgroundColor: "rgba(22, 59, 138, 0.95)",
      height: "95%",
      padding: 20
    },

    modalHead: {
      fontSize: 30,
      color: "#FFF",
      paddingBottom: 20
    },

    wifiFieldLabel: {
      alignContent: "center",
      textAlign: "left",
      textAlignVertical: "center",
      fontWeight: "bold",
      color: "#FFFFFF",
      height: 40,
      fontSize: 16
    },

    wifiField: {
      borderWidth: 0.5,
      borderColor: "#FFF",
      borderRadius: 5,
      paddingHorizontal: 15,
      color: "#FFF"
    },

    video: {
      flex: 1,
      maxHeight: "30%",
      width: "100%"
    }
  
  })