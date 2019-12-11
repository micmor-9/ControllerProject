import Toast from '@remobile/react-native-toast'
import { Buffer } from 'buffer'
import React, { Component } from 'react'
import { FlatList, Image, Linking, Modal, Platform, StatusBar, Text, TouchableOpacity, View, Alert } from 'react-native'
import { WebView } from 'react-native-webview';
import AndroidOpenSettings from 'react-native-android-open-settings'
import AxisPad from 'react-native-axis-pad'
import BluetoothSerial from 'react-native-bluetooth-serial'
import styles from './styles.js'
import { ListItem, Button, Icon, Input } from 'react-native-elements'

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
      <ListItem
        title={device.item.name}
        subtitle={device.item.id}
        bottomDivider
        checkmark={showConnectedIcon && connectedId == device.item.id}
        onPress={() => onDevicePress(device.item)}
      />
    }
  />

class ControllerProject extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEnabled: false,
      devices: [],
      connected: false,
      bluetoothModalVisible: false,
      wifiModalVisible: false,
      wifiIp: 'http://192.168.0.206:8081',
      wifiIpEdit: 'http://192.168.0.206:8081',
      testStatus: false,
      powerStatus: false,
      resetStatus: false,
      lightStatus: false,
      videoStatus: false
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
    //this.updateDevices();
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
    if (this.state.connected == true) {
      this.disconnect(device)
    } else {
      this.connect(device);
    }

    if (this.state.bluetoothModalVisible) {
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

  setBluetoothModalVisible(visible) {
    this.setState({ bluetoothModalVisible: visible });
  }

  //Funzione che apre la schermata dei dispositivi associati
  openDevicesModal() {
    this.setBluetoothModalVisible(!this.state.bluetoothModalVisible);
  }

  //Funzione che apre la schermata dei dati del display
  openDisplayModal() {
    this.playVideo(false);
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
    if (this.state.connected) {
      this.sendMovement(tPower, tAngle);
    }
  }

  //Funzione che invia al dispositivo Bluetooth le coordinate per il movimento
  sendMovement(p, a) {
    var angleString = '(~' + a.toString() + ')';
    var powerString = '(^' + p.toString() + ')';
    var stringToSend = angleString + ':' + powerString;
    console.log(stringToSend);
    this.writePackets(stringToSend, stringToSend.length);
  }

  //Funzione pulsante test
  testButtonHandler() {
    if (this.state.testStatus === false) {
      this.setState({ testStatus: true });
      Toast.showShortBottom('Eseguo test di connessione... TEST ON');
      this.write('(T1)');
    } else {
      this.setState({ testStatus: false });
      Toast.showShortBottom('Eseguo test di connessione... TEST OFF');
      this.write('(T0)');
    }
  }

  //Funzione pulsante power
  powerButtonHandler() {
    if (this.state.powerStatus === false) {
      this.setState({ powerStatus: true });
      Toast.showShortBottom('DISPOSITIVO ACCESO');
      this.write('(P1)');
    } else {
      this.setState({ powerStatus: false });
      Toast.showShortBottom('DISPOSITIVO SPENTO');
      this.write('(P0)');
    }
  }

  //Funzione pulsante reset
  resetButtonHandler() {
    Toast.showShortBottom('Avvio reset...');
    this.write('(R1)');
  }

  //Funzione pulsante play
  playVideo(status = 'no') {
    if(status === 'no') {
      this.webview.stopLoading();
      this.webview.reload();
    }

  }

  //Funzione pulsante light
  lightButtonHandler() {
    if (this.state.lightStatus === false) {
      this.setState({ lightStatus: true });
      Toast.showShortBottom('LUCE ACCESA');
      this.write('(L1)');
    } else {
      this.setState({ lightStatus: false });
      Toast.showShortBottom('LUCE SPENTA');
      this.write('(L0)');
    }

  }

  //Funzione principale che realizza l'interfaccia grafica
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor="#00255d" barStyle="light-content" />
        <View style={styles.topBar}>
          <Text style={styles.heading}>Controller</Text>
          <View style={styles.enableInfoWrapper}>
            <TouchableOpacity onPress={() => { this.playVideo() }} style={styles.topBarButton}>
                <Image
                  source={require('./images/baseline_autorenew_white.png')}
                  style={styles.iconImage}
                />
            </TouchableOpacity>
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

        <View style={styles.video}>
          <WebView
            ref={ref => (this.webview = ref)}
            source={{ uri: this.state.wifiIp }}
            scrollEnabled={false}
            overScrollMode='never'
          />
        </View>

        <View style={styles.padContainer}>
          <AxisPad
            size={220}
            handlerSize={80}
            step={1 / 360}
            resetOnRelease={true}
            autoCenter={false}
            onValue={({ x, y }) => {
              this.joystickHandler(x, y);
            }}
          >
          </AxisPad>

        </View>
        <View style={styles.actionButton}>
          <Icon
            name='power-settings-new'
            type='material'
            color='red'
            size={28}
            raised={true}
            reverse={!this.state.powerStatus}
            onPress={() => this.powerButtonHandler()}
            onLongPress={() => Toast.showShortBottom('Accensione')}
          />
          <Icon
            name='highlight'
            type='material'
            color='#4CAF50'
            size={28}
            raised={true}
            reverse={!this.state.lightStatus}
            onPress={() => this.lightButtonHandler()}
            onLongPress={() => Toast.showShortBottom('Luce')}
          />
          <Icon
            name='report'
            type='material'
            color='#4C5AAF'
            size={28}
            raised={true}
            reverse={!this.state.testStatus}
            onPress={() => this.testButtonHandler()}
            onLongPress={() => Toast.showShortBottom('Test')}
          />
          <Icon
            name='refresh'
            type='material'
            color='#ECD118'
            size={28}
            raised={true}
            reverse={true}
            onPress={() => this.resetButtonHandler()}
            onLongPress={() => Toast.showShortBottom('Reset')}
          />
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
              <Input
                label='IP'
                placeholder='Indirizzo Ip'
                placeholderTextColor='#AAA'
                inputStyle={styles.wifiField}
                labelStyle={styles.wifiField}
                leftIcon={{ type: 'material', name: 'language', color: 'white' }}
                leftIconContainerStyle={{ paddingLeft: 0, paddingRight: 10 }}
                value={this.state.wifiIpEdit}
                onChangeText={(text) => {
                  this.setState({ wifiIpEdit: text })
                }}
              />
            </View>
            <View style={styles.modalButton}>
              <Icon
                name='close'
                type='material'
                color='#00255d'
                size={28}
                raised={true}
                reverse={false}
                onPress={() => {
                  this.setState({ wifiIp: this.state.wifiIpEdit });
                  this.setWifiModalVisible(!this.state.wifiModalVisible);
                }}
              />
            </View>

          </View>
        </Modal>

        <Modal
          animationType="slide"
          visible={this.state.bluetoothModalVisible}
          transparent={true}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          <View style={styles.bluetoothModal}>
            <Text style={styles.modalHead}>Dispositivi Bluetooth</Text>
            {this.state.isEnabled ? (
              <DeviceList
                showConnectedIcon={this.state.connected}
                connectedId={this.state.device && this.state.device.id}
                devices={this.state.devices}
                onDevicePress={(device) => this.onDevicePress(device)}
              />
            ) : null
            }
            <View style={styles.modalButton}>
              <Button
                title='AGGIORNA'
                titleStyle={styles.bluetoothButton}
                type='clear'
                onPress={() => this.updateDevices()}
              />
              <Button
                title='DISPOSITIVO NON TROVATO?'
                titleStyle={styles.bluetoothButton}
                type='clear'
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
              <Icon
                name='close'
                type='material'
                color='#00255d'
                size={28}
                raised={true}
                reverse={false}
                onPress={() => this.setBluetoothModalVisible(!this.state.bluetoothModalVisible)}
              />
            </View>

          </View>
        </Modal>
      </View>
    )
  }
}

export default ControllerProject
