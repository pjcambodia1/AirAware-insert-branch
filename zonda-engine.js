function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function classifyZondaState(input) {
  const pressureShift = input.pressureNow - input.pressure1hAgo;
  const daShift = input.daNow - input.da1hAgo;
  const pldShift = input.pldNow - input.pld1hAgo;
  const pulseShift =
    input.pulseNow && input.pulseBaseline
      ? input.pulseNow - input.pulseBaseline
      : 0;

  let state = "stable";

  if (pressureShift > 0.6 && input.convergence > 0.45) {
    state = "compression";
  }

  if (pressureShift < -0.6 || daShift > 35) {
    state = "unloading";
  }

  if (input.oscillation > 0.55) {
    state = "oscillation";
  }

  const environmentalLoad =
    Math.abs(pressureShift) * 14 +
    Math.abs(daShift) * 0.08 +
    Math.abs(pldShift) * 1.4 +
    input.convergence * 18 +
    input.divergence * 16 +
    input.oscillation * 20;

  let personalLoad = 0;

  if (input.userBpType === "high" && state === "compression") personalLoad += 12;
  if (input.userBpType === "low" && state === "unloading") personalLoad += 12;
  if (Math.abs(pulseShift) > 10) personalLoad += 10;
  if (input.symptomsSelected?.length) personalLoad += input.symptomsSelected.length * 5;
  if (input.feelsNormal === true) personalLoad -= 18;

  const bsiScore = clamp(Math.round(environmentalLoad + personalLoad), 0, 100);

  let highBpLight = "GREEN";
  let lowBpLight = "GREEN";

  if (state === "compression") {
    highBpLight = bsiScore > 70 ? "RED" : bsiScore > 45 ? "ORANGE" : "YELLOW";
    lowBpLight = "GREEN";
  }

  if (state === "unloading") {
    lowBpLight = bsiScore > 70 ? "RED" : bsiScore > 45 ? "ORANGE" : "YELLOW";
    highBpLight = "GREEN";
  }

  if (state === "oscillation") {
    highBpLight = bsiScore > 60 ? "ORANGE" : "YELLOW";
    lowBpLight = bsiScore > 60 ? "ORANGE" : "YELLOW";
  }

  return {
    state,
    bsiScore,
    highBpLight,
    lowBpLight,
    pressureShift,
    daShift,
    pldShift,
    pulseShift,
    environmentalLoad: Math.round(environmentalLoad),
    personalLoad,
    explanation: buildZondaExplanation(state, bsiScore)
  };
}

function buildZondaExplanation(state, score) {
  if (state === "compression") {
    return `Compression-style atmospheric loading is active. BSi is ${score}, driven by rising pressure, convergence, PLD movement, and profile sensitivity.`;
  }

  if (state === "unloading") {
    return `Rapid atmospheric unloading is active. BSi is ${score}, driven by pressure release, DA movement, PLD shift, and low-pressure sensitivity factors.`;
  }

  if (state === "oscillation") {
    return `Atmospheric oscillation is active. BSi is ${score}, driven by unstable directional changes and transition frequency.`;
  }

  return `Atmospheric variables are relatively stable. BSi is ${score}, with low immediate transition burden.`;
}
