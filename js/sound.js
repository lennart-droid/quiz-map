function updateSoundVolume() {
    const volume = soundEnabled ? parseFloat(volumeSlider.value) : 0;
    correctSound.volume = volume;
    wrongSound.volume = volume;
    winSound.volume = volume;
}

soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊" : "🔇";
    updateSoundVolume();
});

volumeSlider.addEventListener("input", () => {
    updateSoundVolume();
});

updateSoundVolume();
