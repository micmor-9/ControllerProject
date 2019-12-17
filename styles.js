import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  iconImage: {
    width: 25,
    height: 25
  },
  topBar: {
    height: '8%',
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
    flex: 3
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  devicesList: {
    height: '50%'
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
    marginHorizontal: '10%',
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center"
  },

  iconButton: {
    width: '20%'
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

  modalHeadCredits: {
    fontWeight: 'bold',
    fontSize: 25,
    color: "#000",
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
    height: "30%",
    width: "100%"
  },

  logoAbout: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },

  logoImage: {
    flex: 2,
    alignItems: 'center',
    resizeMode: 'center'
  },

  aboutIcon: {
    flex: 1,
    alignItems: 'center'
  },

  overlayContent: {
    alignItems: 'center'
  },

  creditsField: {
    height: '20%',
    width: '100%',
    paddingHorizontal: '10%',
    textAlign: 'left'
  },

  creditsName: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'left'
  },

  creditsEmail: {
    textDecorationLine: 'underline',
    color: '#004c8b'
  },

  errorView: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around'
  }

})