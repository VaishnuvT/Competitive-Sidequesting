let activeUtterance = null;

export function speakText(text) {
  if (!("speechSynthesis" in window)) {
    return { ok: false, message: "This browser does not support speech synthesis." };
  }

  window.speechSynthesis.cancel();
  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.rate = 1.02;
  activeUtterance.pitch = 1;
  activeUtterance.volume = 1;
  window.speechSynthesis.speak(activeUtterance);
  return { ok: true, message: "Playing briefing audio through browser speech synthesis." };
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  activeUtterance = null;
}