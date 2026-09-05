/*
 * =========================================================
 *  Smart Home — ESP32 MQTT Firmware
 * =========================================================
 *
 *  Controls two classroom lights via MQTT.
 *
 *  Subscribes to:
 *    - smart_home/light1   (payload: ON / OFF)
 *    - smart_home/light2   (payload: ON / OFF)
 *
 *  Publishes state feedback to:
 *    - smart_home/light1/state
 *    - smart_home/light2/state
 *
 *  Broker : broker.hivemq.com (public, port 1883)
 *
 *  Board  : ESP32 DevKit
 *  Libs   : WiFi.h, PubSubClient.h
 *
 *  ⚠  Replace ssid / password with your own credentials.
 * =========================================================
 */

#include <WiFi.h>
#include <PubSubClient.h>

// =============================
// GPIO PINS
// =============================

#define LIGHT1 2
#define LIGHT2 4


// =============================
// WIFI
// =============================

const char* ssid = "username";
const char* password = "Pass";


// =============================
// MQTT
// =============================

const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);


// =============================
// MQTT CALLBACK
// =============================

void callback(char* topic, byte* message, unsigned int length) {

  String msg = "";

  for (int i = 0; i < length; i++) {
    msg += (char)message[i];
  }

  Serial.print("Topic: ");
  Serial.println(topic);

  Serial.print("Message: ");
  Serial.println(msg);


  // LIGHT 1

  if (String(topic) == "smart_home/light1") {

    if (msg == "ON") {

      digitalWrite(LIGHT1, HIGH);

      client.publish(
        "smart_home/light1/state",
        "ON"
      );

      Serial.println("LIGHT 1 ON");
    }

    else if (msg == "OFF") {

      digitalWrite(LIGHT1, LOW);

      client.publish(
        "smart_home/light1/state",
        "OFF"
      );

      Serial.println("LIGHT 1 OFF");
    }
  }


  // LIGHT 2

  if (String(topic) == "smart_home/light2") {

    if (msg == "ON") {

      digitalWrite(LIGHT2, HIGH);

      client.publish(
        "smart_home/light2/state",
        "ON"
      );

      Serial.println("LIGHT 2 ON");
    }

    else if (msg == "OFF") {

      digitalWrite(LIGHT2, LOW);

      client.publish(
        "smart_home/light2/state",
        "OFF"
      );

      Serial.println("LIGHT 2 OFF");
    }
  }
}


// =============================
// MQTT RECONNECT
// =============================

void reconnect() {

  while (!client.connected()) {

    Serial.print("Connecting to MQTT...");

    String clientId = "PhysicalESP32-";

    clientId += String(random(0xffff), HEX);


    if (client.connect(clientId.c_str())) {

      Serial.println("connected!");

      // Subscribe to commands

      client.subscribe("smart_home/light1");
      client.subscribe("smart_home/light2");

    }

    else {

      Serial.print("failed, rc=");
      Serial.println(client.state());

      delay(5000);
    }
  }
}


// =============================
// SETUP
// =============================

void setup() {

  Serial.begin(115200);


  // LEDs

  pinMode(LIGHT1, OUTPUT);
  pinMode(LIGHT2, OUTPUT);

  digitalWrite(LIGHT1, LOW);
  digitalWrite(LIGHT2, LOW);


  // =============================
  // CONNECT WIFI
  // =============================

  Serial.println();

  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  Serial.println("WiFi connected!");

  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());


  // =============================
  // MQTT
  // =============================

  client.setServer(mqtt_server, 1883);

  client.setCallback(callback);

}


// =============================
// LOOP
// =============================

void loop() {

  if (!client.connected()) {

    reconnect();
  }

  client.loop();
}
