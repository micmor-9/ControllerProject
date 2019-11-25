import Toast from '@remobile/react-native-toast'
import { Buffer } from 'buffer'
import React, { Component } from 'react'
import { Button, FlatList, Image, Platform, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BluetoothSerial from 'react-native-bluetooth-serial'
import AndroidOpenSettings from 'react-native-android-open-settings'
import AxisPad from 'react-native-axis-pad';


global.Buffer = Buffer
const iconv = require('iconv-lite')

const MaterialButton = ({ title, onPress, style, textStyle }) =>
  <TouchableOpacity style={[styles.MaterialButton, style]} onPress={onPress}>
    <Text style={[styles.MaterialButtonText, textStyle]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>


const DeviceList = ({ devices, connectedId, showConnectedIcon, onDevicePress }) =>
  <FlatList
    style={styles.devicesList}
    keyExtractor={(item, index) => item.id}
    data={devices}
    renderItem={device =>
      <TouchableOpacity
        underlayColor='#DDDDDD'
        key={`${device.item.index}_${device.item.index}`}
        style={styles.listItem}
        onPress={() => onDevicePress(device.item)}>
        <View style={{ flexDirection: 'row' }}>
          {showConnectedIcon
            ? (
              <View style={{ width: 48, height: 48, opacity: 0.4 }}>
                {connectedId === device.item.id
                  ? (
                    <Image style={{ resizeMode: 'contain', width: 24, height: 24, flex: 1 }} source={require('./images/ic_done_black_24dp.png')} />
                  ) : null}
              </View>
            ) : null}
          <View style={styles.deviceRow}>
            <Text style={styles.deviceName}>{device.item.name}</Text>
            <Text style={styles.deviceId}>{`<${device.item.id}>`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    }
  />

class ControllerProject extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
      section: 0,
      modalVisible: false,
      power: 0,
      angle: 0
    }
  }

  componentDidMount() {
    this.requestEnable();
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
      .then((values) => {
        const [isEnabled, devices] = values
        this.setState({ isEnabled, devices })
      })

    BluetoothSerial.on('bluetoothEnabled', () => Toast.showShortBottom('Bluetooth attivato'))
    BluetoothSerial.on('bluetoothDisabled', () => Toast.showShortBottom('Bluetooth disattivato'))
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))
    BluetoothSerial.on('connectionLost', () => {
      if (this.state.device) {
        Toast.showShortBottom(`La connessione al dispositivo ${this.state.device.name} si è interrotta`)
      }
      this.setState({ connected: false })
    })
  }

  /**
   * [android]
   * request enable of bluetooth from user
   */
  requestEnable() {
    BluetoothSerial.requestEnable()
      .then((res) => this.setState({ isEnabled: true }))
      .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Connect to bluetooth device by id
   * @param  {Object} device
   */
  connect(device) {
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
      .then((res) => {
        Toast.showShortBottom(`Connesso al dispositivo ${device.name}`)
        this.setState({ device, connected: true, connecting: false })
      })
      .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Disconnect from bluetooth device
   */
  disconnect() {
    BluetoothSerial.disconnect()
      .then(() => this.setState({ connected: false }))
      .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Toggle connection when we have active device
   * @param  {Boolean} value
   */
  toggleConnect(value) {
    if (value === true && this.state.device) {
      this.connect(this.state.device)
    } else {
      this.disconnect()
    }
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  write(message) {
    if (!this.state.connected) {
      Toast.showShortBottom('Devi prima collegarti ad un dispositivo')
    }

    BluetoothSerial.write(message)
      .then((res) => {
        this.setState({ connected: true })
      })
      .catch((err) => Toast.showShortBottom(err.message))
  }

  onDevicePress(device) {
    this.connect(device);
    if (this.state.modalVisible) {
      this.setModalVisible(false);
    }
  }

  updateDevices() {
    BluetoothSerial.list()
      .then((values) => {
        this.setState({ devices: values })
      })
    Toast.showShortBottom('Lista dispositivi aggiornata')
  }

  setDevices(newDevices) {
    this.setState({ devices: newDevices });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  openDevicesModal() {
    this.setModalVisible(!this.state.modalVisible);
  }

  joystickHandler(x, y) {
    y = y * (-1);
    var r = Math.sqrt(x * x + y * y);
    var theta = Math.atan2(y, x);
    var tAngle = Math.round((theta * 180) / Math.PI);
    var tPower = Math.round(r * 100 / (Math.sqrt(2)));
  
    if (tPower > 71) {
      tPower = 71;
    }
  
    tPower = Math.round((tPower * 100) / 71);
    this.setState({ power: tPower });
    this.setState({ angle: tAngle });
    this.sendMovement();
  }

  sendMovement() {
    var angleString = '(~' + this.state.angle.toString + ')';
    var powerString = '(^' + this.state.power.toString + ')';
    var stringToSend = angleString + ':' + powerString;

    this.write(stringToSend);
    
  }

  testButtonHandler() {
    this.write('(T1)');
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Controller</Text>
          <View style={styles.enableInfoWrapper}>
            <TouchableOpacity onPress={() => { this.openDevicesModal() }}>
              {this.state.connected ? (
                <Image
                  source={require('./images/baseline_bluetooth_connected_white.png')}
                  style={styles.iconImage}
                />
              ) : (
                  <Image
                    source={require('./images/baseline_bluetooth_white.png')}
                    style={styles.iconImage}
                  />
                )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 22 }}>
          
          <View style={styles.padContainer}>
            <View>
              <AxisPad
                size={200}
                handlerSize={75}
                step={1 / 360}
                resetOnRelease={true}
                autoCenter={false}
                onValue={({ x, y }) => {
                  this.joystickHandler(x, y);
                }}
              >
              </AxisPad>
            </View>
            <View style={styles.boxContainer}>
              <View style={styles.box}><Text>Power: {this.state.power} </Text></View>
              <View style={styles.box}><Text>Angle: {this.state.angle} </Text></View>
            </View>
            <View style={{marginVertical: 10}}>
              <Button 
                title="Test" 
                onPress={() => this.testButtonHandler}
              />
            </View>
          </View>


          <Modal
            animationType="slide"
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setModalVisible(false);
            }}>
            <View>
              {this.state.isEnabled ? (
                <DeviceList
                  showConnectedIcon={this.state.section === 0}
                  connectedId={this.state.device && this.state.device.id}
                  devices={this.state.devices}
                  onDevicePress={(device) => this.onDevicePress(device)}
                />
              ) : null
              }
              <MaterialButton
                title='CHIUDI'
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}
              />
              <MaterialButton
                title='AGGIORNA'
                onPress={() => this.updateDevices()}
              />
              <MaterialButton
                title='DISPOSITIVO NON TROVATO?'
                onPress={() => {
                  {
                  Platform.OS === 'android' ? (
                    AndroidOpenSettings.bluetoothSettings()
                  ) : (
                      Linking.openURL('prefs:root=General&path=Bluetooth')
                    )
                  };
                }}
              />
            </View>
          </Modal>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxContainer: {
    flexDirection: 'row'
  },
  box: {
    width: '50%',
    fontSize: 10,
    backgroundColor: '#eee',
    justifyContent: "space-between"
  }
})

export default ControllerProject
