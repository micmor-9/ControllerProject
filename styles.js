import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
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
    height: '50%'
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
    justifyContent: 'center',
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
    alignContent: "center",
    alignItems: "center",
    height: "30%",
    marginVertical: 30
  },
  
  boxContainer: {
    flexDirection: 'row'
  },

  buttonContainer: {
    marginVertical: 10,
    flexDirection: "row"
  },

  actionButton: {
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 30,
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    maxHeight: "10%"
  },

  topBarButton: {
    marginLeft: 30
  },

  wifiModal: {
    backgroundColor: "rgba(22, 59, 138, 0.95)",
    height: "100%",
    padding: 20,
  },

  bluetoothModal: {
    backgroundColor: "rgba(22, 59, 138, 0.95)",
    flex: 1,
    alignContent: 'center',
    padding: 20,
  },

  bluetoothButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 30
  },

  bluetoothButton: {
    color: 'white'
  },

  modalHead: {
    fontSize: 30,
    color: "#FFF",
    paddingBottom: 20
  },

  modalButton: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginTop: 10
  },

  wifiField: {
    color: "#FFF"
  },

  video: {
    flex: 1,
    maxHeight: "30%",
    width: "100%"
  }

})