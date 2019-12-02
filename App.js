import Toast from '@remobile/react-native-toast'
import { Buffer } from 'buffer'
import React, { Component } from 'react'
import { Button, FlatList, Image, Linking, Modal, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import AndroidOpenSettings from 'react-native-android-open-settings'
import AxisPad from 'react-native-axis-pad'
import BluetoothSerial from 'react-native-bluetooth-serial'
import { LivePlayer } from "react-native-live-stream"
import AsyncStorage from '@react-native-community/async-storage';
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
    super(props);
    this.state = {
      isEnabled: false,
      devices: [],
      connected: false,
      section: 0,
      modalVisible: false,
      wifiModalVisible: false,
      wifiName: '',
      wifiIp: '',
      wifiPort: '',
      wifiProtocol: '',
      wifiUsername: '',
      wifiPassword: '',
      testStatus: 'off',
      powerStatus: 'off',
      resetStatus: 'off',
      lightStatus: 'off',
      videoStatus: true
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
    } else {
      BluetoothSerial.write(message)
        .then((res) => {
          this.setState({ connected: true })
        })
        .catch((err) => Toast.showShortBottom(err.message))
    }
  }
  // Funzione che consente l'esecuzione asincrona di due o piu thread
  writePackets(message, packetSize = 64) {
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

  setWifiModalVisible(visible) {
    this.setState({ wifiModalVisible: visible });
  }

  //Funzione che apre la schermata dei dispositivi associati
  openDevicesModal() {
    this.setModalVisible(!this.state.modalVisible);
  }

  //Funzione che apre la schermata dei dati del display
  openDisplayModal() {
    this.setWifiModalVisible(!this.state.wifiModalVisible);
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
    //if (this.state.connected) {
    this.sendMovement(tPower, tAngle);
    //}
  }

  sendMovement(p, a) {
    var angleString = '(~' + a.toString() + ')';
    var powerString = '(^' + p.toString() + ')';
    var stringToSend = angleString + ':' + powerString;
    console.log(stringToSend);
    this.writePackets(stringToSend);
  }

  testButtonHandler() {
    Toast.showShortBottom('Eseguo test di connessione...');
    this.write('(T1)');
  }

  powerButtonHandler() {
    if (this.state.powerStatus === 'off') {
      this.setState({ powerStatus: 'on' });
      Toast.showShortBottom('DISPOSITIVO ACCESO');
      this.write('(P1)');
    } else {
      this.setState({ powerStatus: 'off' });
      Toast.showShortBottom('DISPOSITIVO SPENTO');
      this.write('(P0)');
    }
  }

  resetButtonHandler() {
    this.setState({ videoStatus: !this.state.videoStatus });
    Toast.showShortBottom('Avvio reset...');
    this.write('(R1)');
  }

  lightButtonHandler() {
    if (this.state.lightStatus === 'off') {
      this.setState({ lightStatus: 'on' });
      Toast.showShortBottom('LUCE ACCESA');
      this.write('(L1)');
    } else {
      this.setState({ lightStatus: 'off' });
      Toast.showShortBottom('LUCE SPENTA');
      this.write('(L0)');
    }

  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor="#00255d" barStyle="light-content" />
        <View style={styles.topBar}>
          <Text style={styles.heading}>Controller</Text>
          <View style={styles.enableInfoWrapper}>
            <TouchableOpacity onPress={() => { this.openDisplayModal() }} style={styles.topBarButton}>
              <Image
                source={require('./images/baseline_airplay_white.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { this.openDevicesModal() }} style={styles.topBarButton}>
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

        <LivePlayer 
          source={{ uri: "rtmp://fms.105.net/live/rmc1" }}
          ref={(ref) => {
            this.player = ref
          }}
          style={styles.video}
          paused={this.state.videoStatus}
          muted={false}
          bufferTime={300}
          maxBufferTime={1000}
          resizeMode={"cover"}
          onLoading={() => {
            
          }}
          onLoad={() => { 
            Toast.showShortBottom('Video caricato');
          }}
          onEnd={() => { 

          }}
        />

        <View>

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

            {/* <View style={styles.boxContainer}>
              <View style={styles.box}><Text>Power: {this.state.power} </Text></View>
              <View style={styles.box}><Text>Angle: {this.state.angle} </Text></View>
            </View> */}
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.actionButton}>
              <Button
                title={"Test"}
                onPress={() => this.testButtonHandler()}
              />
            </View>

            <View style={styles.actionButton}>
              <Button
                style={styles.actionButton}
                title={"Power " + this.state.powerStatus}
                onPress={() => this.powerButtonHandler()}
              />
            </View>

            <View style={styles.actionButton}>
              <Button
                style={styles.actionButton}
                title={"Reset"}
                onPress={() => this.resetButtonHandler()}
              />
            </View>

            <View style={styles.actionButton}>
              <Button
                style={styles.actionButton}
                title={"Light " + this.state.lightStatus}
                onPress={() => this.lightButtonHandler()}
              />
            </View>
          </View>

          <Modal
            animationType="slide"
            visible={this.state.wifiModalVisible} 
            transparent={true}           
            onRequestClose={() => {
              this.setWifiModalVisible(false);
            }}>

            <View style={styles.wifiModal}>
              <Text style={styles.modalHead}>Impostazioni streaming</Text>
              <View style={styles.wifiFieldView}>
                <Text style={styles.wifiFieldLabel}>Nome</Text>
                <TextInput
                  style={styles.wifiField}
                  value={this.state.wifiName}
                  onChangeText={(enteredText) => {
                    this.setState({ wifiName: enteredText })
                  }}
                />
              </View>
              <View style={styles.wifiFieldView}>
                <Text style={styles.wifiFieldLabel}>IP</Text>
                <TextInput
                  style={styles.wifiField}
                  value={this.state.wifiIp}
                  onChangeText={(enteredText) => {
                    this.setState({ wifiIp: enteredText })
                  }}
                />
              </View>
              <View style={styles.wifiFieldView}>
                <Text style={styles.wifiFieldLabel}>Port</Text>
                <TextInput
                  style={styles.wifiField}
                  value={this.state.wifiPort}
                  onChangeText={(enteredText) => {
                    this.setState({ wifiPort: enteredText })
                  }}
                />
              </View>
              <View style={styles.wifiFieldView}>
                <Text style={styles.wifiFieldLabel}>Protocol</Text>
                <TextInput
                  style={styles.wifiField}
                  value={this.state.wifiProtocol}
                  onChangeText={(enteredText) => {
                    this.setState({ wifiProtocol: enteredText })
                  }}
                />
              </View>
              <View style={styles.wifiFieldView}>
                <Text style={styles.wifiFieldLabel}>Username</Text>
                <TextInput
                  style={styles.wifiField}
                  value={this.state.wifiUsername}
                  onChangeText={(enteredText) => {
                    this.setState({ wifiUsername: enteredText })
                  }}
                />
              </View>
              <View style={styles.wifiFieldView}>
                <Text style={styles.wifiFieldLabel}>Password</Text>
                <TextInput
                  style={styles.wifiField}
                  value={this.state.wifiPassword}
                  onChangeText={(enteredText) => {
                    this.setState({ wifiPassword: enteredText })
                  }}
                />
              </View>
            </View>
            <MaterialButton
              title='CHIUDI'
              onPress={() => {
                this.setWifiModalVisible(!this.state.wifiModalVisible);
              }}
            />
          </Modal>

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
