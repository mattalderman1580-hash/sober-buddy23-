export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string): boolean {
  if (!canSpeak() || !text.trim()) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.trim());
  utter.rate = 0.92;
  utter.pitch = 1;
  utter.lang = "en-US";
  const voices = window.speechSynthesis.getVoices();
  const en = voices.find((v) => v.lang.startsWith("en") && /natural|premium|enhanced/i.test(v.name))
    ?? voices.find((v) => v.lang.startsWith("en"));
  if (en) utter.voice = en;
  window.speechSynthesis.speak(utter);
  return true;
}

export function stopSpeak(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
