function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function classifyZondaState(input) {
  const pressureShift = input.pressureNow - input.pressure1hAgo;
  const daShift = input.daNow - input.da1hAgo;
  const pldShift = input.pldNow - input.pld1hAgo;
  const pulseShift = input.pulseNow && input.pulseBaseline
    ? input.pulseNow - input.pulseBaseline
    : 0;

  const velocityLoad =
    Math.abs(pressureShift) * 12 +
    Math.abs(daShift) * 0.08 +
    Math.abs(pldShift) * 1.5;

  const convergenceLoad = input.convergence * 18;
  const divergenceLoad = input.divergence * 16;
  const oscillationLoad = input.oscillation * 20;

  let state = "stable";

  if (pressureShift > 0.7 && input.convergence > 0.45) {
    state = "compression";
  }

  if (pressureShift < -0.7 || daShift > 40) {
    state = "unloading";
  }

  if (input.oscillation > 0.55) {
    state = "oscillation";
  }

  const environmentalBurden =
    velocityLoad +
    convergenceLoad +
    divergenceLoad +
    oscillationLoad;

  let personalModifier = 0;

  if (input.userBpType === "high" && state === "compression") {
    personalModifier += 12;
  }

  if (input.userBpType === "low" && state === "unloading") {
    personalModifier += 12;
  }

  if (Math.abs(pulseShift) > 10) {
    personalModifier += 10;
  }

  if (input.symptomsSelected?.length > 0) {
    personalModifier += input.symptomsSelected.length * 5;
  }

  if (input.feelsNormal === true) {
    personalModifier -= 18;
  }

  const rawScore = environmentalBurden + personalModifier;

  const bsiScore = clamp(Math.round(rawScore), 0, 100);

  let highBpLight = "green";
  let lowBpLight = "green";

  if (state === "compression") {
    highBpLight = bsiScore > 70 ? "red" : bsiScore > 45 ? "orange" : "yellow";
    lowBpLight = "green";
  }

  if (state === "unloading") {
    lowBpLight = bsiScore > 70 ? "red" : bsiScore > 45 ? "orange" : "yellow";
    highBpLight = "green";
  }

  if (state === "oscillation") {
    highBpLight = bsiScore > 60 ? "orange" : "yellow";
    lowBpLight = bsiScore > 60 ? "orange" : "yellow";
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
    environmentalBurden: Math.round(environmentalBurden),
    personalModifier,
    explanation: buildZondaExplanation(state, bsiScore, input)
  };
}

function buildZondaExplanation(state, score, input) {
  if (state === "compression") {
    return `Compression-style atmospheric loading is active. BSi is ${score}, influenced by rising pressure, convergence, PLD movement, and your selected sensitivity profile.`;
  }

  if (state === "unloading") {
    return `Rapid atmospheric unloading is active. BSi is ${score}, influenced by pressure release, DA movement, PLD shift, and low-pressure sensitivity factors.`;
  }

  if (state === "oscillation") {
    return `Atmospheric oscillation is active. BSi is ${score}, influenced by unstable directional changes and transition frequency.`;
  }

  return `Atmospheric variables are relatively stable. BSi is ${score}, with low immediate transition burden.`;
}
