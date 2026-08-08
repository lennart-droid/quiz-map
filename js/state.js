let svgPath = [];
let provinceGroups = [];

const toggle = document.querySelector('.toggle');
const scoreDiv = document.getElementById('score');
const modeSelect = document.getElementById('mode');

const correctSound = new Audio("sounds/correctSound.m4a");
const wrongSound = new Audio("sounds/wrongSound.m4a");
const winSound = new Audio("sounds/winSound.m4a");

const deleteMapBtn = document.getElementById("deleteMapBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const volumeSlider = document.getElementById("volumeSlider");
const mapMenuBtn = document.getElementById("mapMenuBtn");
const mapMenu = document.getElementById("mapMenu");
const toggleMapBtn = document.getElementById("toggleMapBtn");
const markModeToggle = document.getElementById("markModeToggle");

const mapSelect = document.getElementById("mapSelect");
const addMapBtn = document.getElementById("addMapBtn");
const mapModal = document.getElementById("mapModal");
const regionProvinceList = document.getElementById("regionProvinceList");
const saveMapBtn = document.getElementById("saveMapBtn");
const cancelMapBtn = document.getElementById("cancelMapBtn");

const mouseBtn = document.getElementById("mouseBtn");
const tooltipModal = document.getElementById("tooltipModal");
const generalTooltipSizeInput = document.getElementById("generalTooltipSize");
const provinceTooltipList = document.getElementById("provinceTooltipList");
const saveTooltipBtn = document.getElementById("saveTooltipBtn");
const cancelTooltipBtn = document.getElementById("cancelTooltipBtn");

let excludeList = JSON.parse(localStorage.getItem('excludeList')) || [];
let shuffledPaths = [];
let guessedCount = 0;
let totalAttempts = 0;
let currentIndex = 0;
const failColors = ["#ffff66", "#ffa500", "#ff0000"];
const failCounts = {};
let mode = modeSelect.value;
const guessedPaths = new Set();
const finalColors = {};
const blinkingIntervals = {};
let soundEnabled = true;

let customMaps = JSON.parse(localStorage.getItem("customMaps")) || {};
let activeMap = "default";
let mapExcludeLists = JSON.parse(localStorage.getItem("mapExcludeLists")) || {};
let markMode = false;

let tooltipSettings = JSON.parse(localStorage.getItem("tooltipSettings")) || {
    generalSize: 12,
    provinces: {}
};
