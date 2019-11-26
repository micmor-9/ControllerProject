import Toast from '@remobile/react-native-toast'
import { Buffer } from 'buffer'
import React, { Component } from 'react'
import { Button, FlatList, Image, Platform, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BluetoothSerial from 'react-native-bluetooth-serial'
import AndroidOpenSettings from 'react-native-android-open-settings'
import AxisPad from 'react-native-axis-pad';
import styles from './styles.js'


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
      devices: [],
      connected: false,
      section: 0,
      modalVisible: false,
      power: 0,
      angle: 0
    }
  }

  componentDidMount() {
    this.requestEnable();  // richiede che sia abilitato il Bluetooth 
    Promise.all([
      BluetoothSerial.isEnabled(), // controlla se il Bluetooth è attivo
      BluetoothSerial.list() // genera la lista dei dispositivi associati
    ])
      .then((values) => {
        const [isEnabled, devices] = values
        this.setState({ isEnabled, devices }) //aggiorniamo variabili di stato
      })
// Generiamo una notifica per l'utente
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
      .then((res) => this.setState({ isEnabled: true })) //richiesta Bluetooth andata a buon fine 
      .catch((err) => Toast.showShortBottom(err.message)) //rileva eventuale errore
  }

  /**
   *Funzione per la connessione al dispositivo Bluetooth
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
   * Funzione per la disconnessione dal Bluetooth
   */
  disconnect() {
    BluetoothSerial.disconnect()
      .then(() => this.setState({ connected: false }))
      .catch((err) => Toast.showShortBottom(err.message))
  } 
  /**
   * Invia un messaggio al dispositivo
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
// Funzione che consente l'esecuzione asincrona di due o piu thread
  writePackets (message, packetSize = 64) {
    const toWrite = iconv.encode(message, 'cp852')
    const writePromises = []
    const packetCount = Math.ceil(toWrite.length / packetSize)

    for (var i = 0; i < packetCount; i++) {
      const packet = new Buffer(packetSize)
      packet.fill(' ')
      toWrite.copy(packet, 0, i * packetSize, (i + 1) * packetSize)
      writePromises.push(BluetoothSerial.write(packet))
    }

    Promise.all(writePromises)
    .then((result) => {
    })
  }
  // Funzione che viene chiamata quando si seleziona un dispositivo dalla lista 

  onDevicePress(device) {
    this.connect(device);
    if (this.state.modalVisible) {
      this.setModalVisible(false);
    }
  }
//Funzione che aggiorna la lista dei dispositivi accoppiati 
  updateDevices() {
    BluetoothSerial.list()
      .then((values) => {
        this.setState({ devices: values })
      })
    Toast.showShortBottom('Lista dispositivi aggiornata')
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
//Funzione che apre la schermata dei dispositivi associati
  openDevicesModal() {
    this.setModalVisible(!this.state.modalVisible);
  }
//Implementazione del joystick
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
    this.writePackets(stringToSend);
  }

  testButtonHandler() {
    this.write('(T1)');
  }
  powerButtonHandler(){
    this.write('(P1)');
  }
  resetButtonHandler(){
    this.write('(R1)');
  }
  lightButtonHandler(){
    this.write('(L1)');
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
            <View style={styles.buttonContainer}>
              <Button 
                title="Test" 
                onPress={() => this.testButtonHandler}
              />
              <Button
                title="Power"
                onPress={() => this.powerButtonHandler}
                />
                <Button
                  title="Reset"
                  onPress= {() => this.resetButtonHandler}
                  />
                  <Button
                  title="Light"
                  onPress= {() => this.lightButtonHandler}
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

export default ControllerProject
