/* =====================================================
   MQTT
   ===================================================== */

const broker =
    "wss://broker.hivemq.com:8884/mqtt";


const client =
    mqtt.connect(
        broker,
        {

            clientId:
                "SmartHomeWeb-" +
                Math.random()
                    .toString(16)
                    .substring(2),

            clean: true,

            connectTimeout: 5000,

            reconnectPeriod: 2000

        }
    );



/* =====================================================
   MQTT CONNECTED
   ===================================================== */

client.on(
    "connect",
    function () {

        console.log(
            "MQTT connected"
        );


        updateConnection(
            true
        );


        client.subscribe(
            "smart_home/light1/state"
        );


        client.subscribe(
            "smart_home/light2/state"
        );

    }
);



/* =====================================================
   MQTT ERROR
   ===================================================== */

client.on(
    "error",
    function (error) {

        console.log(
            "MQTT Error:",
            error
        );


        updateConnection(
            false,
            "Connection error"
        );

    }
);



/* =====================================================
   MQTT OFFLINE
   ===================================================== */

client.on(
    "offline",
    function () {

        updateConnection(
            false,
            "Reconnecting..."
        );

    }
);



/* =====================================================
   CONNECTION UI
   ===================================================== */

function updateConnection(
    connected,
    message = ""
) {

    const connection =
        document.getElementById(
            "connection"
        );

    const dot =
        document.getElementById(
            "connectionDot"
        );

    const text =
        document.getElementById(
            "connectionText"
        );

    const badge =
        document.getElementById(
            "statusBadge"
        );

    const mqttOverview =
        document.getElementById(
            "overviewMqtt"
        );


    if (connected) {

        connection.style.background =
            "var(--success-soft)";
        connection.style.color =
            "var(--success)";
        connection.style.borderColor =
            "rgba(16, 185, 129, 0.15)";

        dot.style.background =
            "var(--success)";

        text.innerText =
            "Connected";

        badge.innerText =
            "ONLINE";
        badge.className =
            "overview-badge online";

        if (mqttOverview) {
            mqttOverview.innerHTML =
                'Connected <span id="statusBadge" class="overview-badge online">ONLINE</span>';
        }

    } else {

        connection.style.background =
            "var(--warning-soft)";
        connection.style.color =
            "#b45309";
        connection.style.borderColor =
            "rgba(245, 158, 11, 0.15)";

        dot.style.background =
            "var(--warning)";

        text.innerText =
            "Reconnecting";

        badge.innerText =
            "OFFLINE";
        badge.className =
            "overview-badge offline";

        if (mqttOverview) {
            mqttOverview.innerHTML =
                (message || "Disconnected") + ' <span id="statusBadge" class="overview-badge offline">OFFLINE</span>';
        }

    }

}



/* =====================================================
   RECEIVE MQTT MESSAGE
   ===================================================== */

client.on(
    "message",
    function (topic, message) {

        const value =
            message
                .toString()
                .trim()
                .toUpperCase();


        console.log(
            topic,
            value
        );


        if (
            topic ===
            "smart_home/light1/state"
        ) {

            updateLight(
                1,
                value
            );

        }


        if (
            topic ===
            "smart_home/light2/state"
        ) {

            updateLight(
                2,
                value
            );

        }

    }
);



/* =====================================================
   TOGGLE LIGHT
   ===================================================== */

function toggleLight(
    lightNumber
) {

    const checkbox =
        document.getElementById(
            "light" +
            lightNumber
        );


    const state =
        checkbox.checked
            ? "ON"
            : "OFF";


    const topic =
        "smart_home/light" +
        lightNumber;


    client.publish(
        topic,
        state
    );


    console.log(
        "Published:",
        topic,
        state
    );

}



/* =====================================================
   UPDATE LIGHT UI
   ===================================================== */

function updateLight(
    lightNumber,
    state
) {

    const checkbox =
        document.getElementById(
            "light" +
            lightNumber
        );


    const device =
        document.getElementById(
            "device" +
            lightNumber
        );


    const status =
        document.getElementById(
            "light" +
            lightNumber +
            "Status"
        );


    const stateText =
        document.getElementById(
            "light" +
            lightNumber +
            "State"
        );


    if (state === "ON") {

        checkbox.checked = true;

        device.classList.add(
            "on"
        );

        status.innerText =
            "ON";

        stateText.innerHTML =
            '<i data-lucide="power" stroke-width="2" style="width:14px;height:14px;"></i> Light is currently on';

    } else {

        checkbox.checked = false;

        device.classList.remove(
            "on"
        );

        status.innerText =
            "OFF";

        stateText.innerHTML =
            '<i data-lucide="power" stroke-width="2" style="width:14px;height:14px;"></i> Light is currently off';

    }

    // Re-render icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}
