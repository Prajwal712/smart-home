/* =====================================================
   AUTOMATED SCHEDULER ENGINE
   ===================================================== */

const SCHEDULE_STORAGE_KEY = "smartHomeSchedules";
let selectedDaysSet = new Set([1, 2, 3, 4, 5]);

// Initial schedules setup
function getSchedules() {
    try {
        const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
        if (!raw) {
            const defaultSchedules = [
                {
                    id: "sched_default_1",
                    deviceId: 1,
                    deviceName: "Classroom 1",
                    label: "Classroom 1 Morning Schedule",
                    days: [1, 2, 3, 4, 5],
                    startTime: "08:00",
                    durationMinutes: 120,
                    enabled: true
                }
            ];
            localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(defaultSchedules));
            return defaultSchedules;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load schedules", e);
        return [];
    }
}

function saveSchedules(schedules) {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
    renderSchedules();
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTime24to12(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function minutesToFormattedTime(totalMinutes) {
    const normalized = (totalMinutes % 1440 + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h} hr ${m} mins`;
    if (h > 0) return `${h} ${h === 1 ? 'hr' : 'hrs'}`;
    return `${m} mins`;
}

// Modal Control Functions
function openScheduleModal(deviceId = null) {
    const modal = document.getElementById("scheduleModal");
    if (deviceId) {
        document.getElementById("schedDevice").value = String(deviceId);
    }
    document.getElementById("schedLabel").value = deviceId === 2 ? "Classroom 2 Class Schedule" : "Classroom 1 Class Schedule";
    selectedDaysSet = new Set([1, 2, 3, 4, 5]);
    updateDayButtons();
    document.getElementById("schedStartTime").value = "08:00";
    document.getElementById("schedHours").value = 2;
    document.getElementById("schedMinutes").value = 0;
    updateTimePreview();
    modal.classList.add("active");
    // Re-render icons inside modal
    setTimeout(function() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }, 50);
}

function closeScheduleModal() {
    document.getElementById("scheduleModal").classList.remove("active");
}

function handleModalOverlayClick(event) {
    if (event.target.id === "scheduleModal") {
        closeScheduleModal();
    }
}

function toggleDayBtn(dayNumber) {
    if (selectedDaysSet.has(dayNumber)) {
        if (selectedDaysSet.size > 1) {
            selectedDaysSet.delete(dayNumber);
        }
    } else {
        selectedDaysSet.add(dayNumber);
    }
    updateDayButtons();
}

function updateDayButtons() {
    document.querySelectorAll(".day-btn").forEach(btn => {
        const dayNum = Number(btn.getAttribute("data-day"));
        if (selectedDaysSet.has(dayNum)) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

function selectDayPreset(preset) {
    if (preset === 'weekdays') selectedDaysSet = new Set([1, 2, 3, 4, 5]);
    else if (preset === 'weekends') selectedDaysSet = new Set([6, 7]);
    else if (preset === 'everyday') selectedDaysSet = new Set([1, 2, 3, 4, 5, 6, 7]);
    updateDayButtons();
}

function setDurationPreset(hours, minutes) {
    document.getElementById("schedHours").value = hours;
    document.getElementById("schedMinutes").value = minutes;
    updateTimePreview();
}

function updateTimePreview() {
    const startTimeStr = document.getElementById("schedStartTime").value || "08:00";
    const hours = parseInt(document.getElementById("schedHours").value) || 0;
    const minutes = parseInt(document.getElementById("schedMinutes").value) || 0;
    const totalDuration = hours * 60 + minutes;

    const [startH, startM] = startTimeStr.split(":").map(Number);
    const startTotalMins = startH * 60 + startM;
    const endTotalMins = startTotalMins + totalDuration;

    const startFormatted = formatTime24to12(startTimeStr);
    const endFormatted = minutesToFormattedTime(endTotalMins);
    const durationFormatted = formatDuration(totalDuration);

    const previewText = `Light will automatically turn <strong>ON</strong> at <strong>${startFormatted}</strong> and turn <strong>OFF</strong> at <strong>${endFormatted}</strong> (Duration: ${durationFormatted})`;
    document.getElementById("timePreviewText").innerHTML = previewText;
}

function saveScheduleForm(event) {
    event.preventDefault();
    const deviceId = parseInt(document.getElementById("schedDevice").value);
    const label = document.getElementById("schedLabel").value.trim() || `Classroom ${deviceId} Schedule`;
    const startTime = document.getElementById("schedStartTime").value;
    const hours = parseInt(document.getElementById("schedHours").value) || 0;
    const minutes = parseInt(document.getElementById("schedMinutes").value) || 0;
    const durationMinutes = hours * 60 + minutes;

    if (durationMinutes <= 0) {
        alert("Please set a duration greater than 0 minutes.");
        return;
    }

    const daysArray = Array.from(selectedDaysSet).sort((a, b) => a - b);
    const deviceName = deviceId === 1 ? "Classroom 1" : "Classroom 2";

    const newSched = {
        id: "sched_" + Date.now(),
        deviceId: deviceId,
        deviceName: deviceName,
        label: label,
        days: daysArray,
        startTime: startTime,
        durationMinutes: durationMinutes,
        enabled: true
    };

    const schedules = getSchedules();
    schedules.push(newSched);
    saveSchedules(schedules);

    closeScheduleModal();
    showToast("Schedule Saved", `${label} for ${deviceName} added successfully`, "check");
    checkSchedules();
}

function toggleSchedule(id) {
    const schedules = getSchedules();
    const sched = schedules.find(s => s.id === id);
    if (sched) {
        sched.enabled = !sched.enabled;
        saveSchedules(schedules);
        showToast(sched.enabled ? "Schedule Enabled" : "Schedule Disabled", `Schedule "${sched.label}" is now ${sched.enabled ? 'active' : 'paused'}`, "clock");
        checkSchedules();
    }
}

function deleteSchedule(id) {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    let schedules = getSchedules();
    const sched = schedules.find(s => s.id === id);
    schedules = schedules.filter(s => s.id !== id);
    saveSchedules(schedules);
    if (sched) {
        showToast("Schedule Deleted", `Removed "${sched.label}"`, "trash-2");
    }
    checkSchedules();
}

function updateScheduleCount() {
    const schedules = getSchedules();
    const activeCount = schedules.filter(s => s.enabled).length;
    const el = document.getElementById("overviewSchedules");
    if (el) {
        el.textContent = activeCount + " Active";
    }
}

function renderSchedules() {
    const container = document.getElementById("schedulesList");
    if (!container) return;

    const schedules = getSchedules();
    updateScheduleCount();

    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="empty-schedules" style="grid-column: 1 / -1;">
                <div class="empty-schedules-icon">
                    <i data-lucide="calendar-x" stroke-width="2"></i>
                </div>
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px; color: var(--heading);">No Schedules Set</div>
                <div style="font-size: 13px; font-weight: 500;">Create automated weekly schedules to turn Classroom lights ON & OFF automatically.</div>
                <button class="btn-primary-sm" style="margin-top: 18px;" onclick="openScheduleModal()">
                    <i data-lucide="plus" stroke-width="2.5"></i>
                    Create First Schedule
                </button>
            </div>
        `;
        if (typeof lucide !== "undefined") lucide.createIcons();
        return;
    }

    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    container.innerHTML = schedules.map(sched => {
        const [sH, sM] = sched.startTime.split(":").map(Number);
        const startMins = sH * 60 + sM;
        const endMins = startMins + sched.durationMinutes;

        const isToday = sched.days.includes(currentDay);
        let isActiveNow = false;
        if (sched.enabled && isToday) {
            if (endMins <= 1440) {
                isActiveNow = (currentMinutes >= startMins && currentMinutes < endMins);
            } else {
                isActiveNow = (currentMinutes >= startMins || currentMinutes < (endMins % 1440));
            }
        }

        const daysChipsHTML = [1, 2, 3, 4, 5, 6, 7].map(d => {
            const activeClass = sched.days.includes(d) ? 'active' : '';
            return `<div class="day-chip ${activeClass}">${DAY_NAMES[d - 1]}</div>`;
        }).join('');

        const statusBadgeHTML = !sched.enabled
            ? `<span class="schedule-status-badge off">Disabled</span>`
            : isActiveNow
            ? `<span class="schedule-status-badge active">● Active Now</span>`
            : `<span class="schedule-status-badge upcoming">◐ Scheduled</span>`;

        return `
            <div class="schedule-card ${!sched.enabled ? 'disabled' : ''}">
                <div class="schedule-card-header">
                    <div class="schedule-device-info">
                        <div class="schedule-icon">
                            <i data-lucide="lightbulb" stroke-width="2"></i>
                        </div>
                        <div>
                            <div class="schedule-title">${sched.label}</div>
                            <div class="schedule-subtitle">${sched.deviceName}</div>
                        </div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${sched.enabled ? 'checked' : ''} onchange="toggleSchedule('${sched.id}')">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="schedule-time-box">
                    <div>
                        <div class="schedule-time-label">Time Slot</div>
                        <div class="schedule-time-range">${formatTime24to12(sched.startTime)} – ${minutesToFormattedTime(endMins)}</div>
                    </div>
                    <div class="schedule-duration-pill">
                        <i data-lucide="timer" stroke-width="2"></i>
                        ${formatDuration(sched.durationMinutes)}
                    </div>
                </div>

                <div class="schedule-days-container">
                    ${daysChipsHTML}
                </div>

                <div class="schedule-card-footer">
                    ${statusBadgeHTML}
                    <button class="delete-sched-btn" title="Delete Schedule" onclick="deleteSchedule('${sched.id}')">
                        <i data-lucide="trash-2" stroke-width="2"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Re-render icons after dynamic render
    if (typeof lucide !== "undefined") lucide.createIcons();
}

// Checking & Executing Schedules Loop
const activeScheduleStates = {};

function checkSchedules() {
    const schedules = getSchedules();
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const deviceIntendedStates = { 1: false, 2: false };
    const deviceActiveScheduleLabels = { 1: "", 2: "" };
    const deviceNextScheduleTimes = { 1: null, 2: null };

    schedules.forEach(sched => {
        if (!sched.enabled) return;

        const [sH, sM] = sched.startTime.split(":").map(Number);
        const startMins = sH * 60 + sM;
        const endMins = startMins + sched.durationMinutes;

        const isToday = sched.days.includes(currentDay);
        let inWindow = false;

        if (isToday) {
            if (endMins <= 1440) {
                inWindow = (currentMinutes >= startMins && currentMinutes < endMins);
            } else {
                inWindow = (currentMinutes >= startMins || currentMinutes < (endMins % 1440));
            }
        }

        if (inWindow) {
            deviceIntendedStates[sched.deviceId] = true;
            deviceActiveScheduleLabels[sched.deviceId] = `${sched.label} (until ${minutesToFormattedTime(endMins)})`;
        } else if (isToday && currentMinutes < startMins) {
            if (!deviceNextScheduleTimes[sched.deviceId] || startMins < deviceNextScheduleTimes[sched.deviceId].startMins) {
                deviceNextScheduleTimes[sched.deviceId] = {
                    label: sched.label,
                    startMins: startMins,
                    durationMinutes: sched.durationMinutes,
                    timeStr: formatTime24to12(sched.startTime)
                };
            }
        }
    });

    [1, 2].forEach(devId => {
        const shouldBeOn = deviceIntendedStates[devId];
        const wasOnBySched = !!activeScheduleStates[devId];

        if (shouldBeOn && !wasOnBySched) {
            activeScheduleStates[devId] = true;
            const devName = devId === 1 ? "Classroom 1" : "Classroom 2";
            client.publish(`smart_home/light${devId}`, "ON");
            updateLight(devId, "ON");
            showToast("Schedule Triggered", `${devName} automatically turned ON according to active schedule`, "zap");
        } else if (!shouldBeOn && wasOnBySched) {
            activeScheduleStates[devId] = false;
            const devName = devId === 1 ? "Classroom 1" : "Classroom 2";
            client.publish(`smart_home/light${devId}`, "OFF");
            updateLight(devId, "OFF");
            showToast("Schedule Completed", `${devName} automatically turned OFF as schedule ended`, "moon");
        }
    });

    updateDeviceScheduleBadges(deviceIntendedStates, deviceActiveScheduleLabels, deviceNextScheduleTimes);
}

function updateDeviceScheduleBadges(activeStates = {}, activeLabels = {}, nextTimes = {}) {
    [1, 2].forEach(devId => {
        const badge = document.getElementById(`light${devId}SchedBadge`);
        if (!badge) return;

        if (activeStates[devId]) {
            badge.className = "device-sched-badge active-now";
            badge.innerHTML = `● Active: ${activeLabels[devId] || 'Schedule Running'}`;
        } else if (nextTimes[devId]) {
            badge.className = "device-sched-badge";
            badge.innerHTML = `⏰ Scheduled today at ${nextTimes[devId].timeStr} (${formatDuration(nextTimes[devId].durationMinutes)})`;
        } else {
            badge.className = "device-sched-badge hidden";
            badge.innerHTML = "";
        }
    });
}

// Toast Notification System
function showToast(title, message, iconName = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <div class="toast-icon-wrap">
            <i data-lucide="${iconName}" stroke-width="2"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${message}</div>
        </div>
    `;
    container.appendChild(toast);

    // Render icon in toast
    if (typeof lucide !== "undefined") lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px) scale(0.95)";
        toast.style.transition = "0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Run scheduler check on load and every 3 seconds
window.addEventListener("DOMContentLoaded", function () {
    renderSchedules();
    updateTimePreview();
    checkSchedules();
    setInterval(checkSchedules, 3000);
});
