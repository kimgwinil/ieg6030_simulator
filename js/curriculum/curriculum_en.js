/**
 * IEG-6030 — English text for labs (EXPERIMENTS_EN, keyed by lab id) and practice questions (PRACTICE_QUESTIONS_EN)
 */
export const EXPERIMENTS_EN = {
 "GEN-01": {
  "category": "Generator Lab",
  "title": "Lab 01. Basic Principle of the Generator",
  "goal": "Form a field with permanent magnets, observe the AC EMF induced when a copper-wire (coil) conductor is moved quickly through the magnetic field, and understand the factors that determine the magnitude of the induced EMF.",
  "procedure": [
   "Mount the DC Milliammeter (09) and the Field Frame (10) on the rack.",
   "Fit the rotor holder and the disk-slot Type-A rotor (slip rings, Type-A brushes) onto the field frame.",
   "Attach an N-pole permanent magnet at P1 and an S-pole permanent magnet at P5, and tighten them with the fixing bolts.",
   "Wire field-frame terminals A2 and B2 to the (+) and (−) terminals of the DC milliammeter.",
   "Set the milliammeter to the ±50mA range and turn the rotor with [↷ CW Manual] / [↶ CCW Manual] or [▶ Continuous Spin (150 rpm)]; observe the pointer swinging alternately to + and − (AC). Switch to the ±5mA range and observe again."
  ],
  "expectedReadings": {
   "meter": "DC Milliammeter",
   "value": "Continuous spin at 150rpm: EMF 1.21V (RMS) → pointer swings left and right up to about ±5.7mA (I = √2·E / (Ra+Rg) = √2×1.21 / 302.5Ω)"
  },
  "verifyLabels": [
   "Milliammeter deflection"
  ],
  "poleLabels": {
   "P1": "N pole",
   "P5": "S pole"
  }
 },
 "GEN-02": {
  "category": "Generator Lab",
  "title": "Lab 02. Single-Phase AC Generator with Permanent Magnets",
  "goal": "Understand the construction of a single-phase AC generator whose field is formed by round permanent magnets, and measure the waveform and frequency characteristics of the induced AC EMF.",
  "procedure": [
   "Place the AC Volt/Ampere Meter (07), Field Frame (10), and drive motor (11) on the rack.",
   "Attach the round permanent magnets at P1 (N) and P5 (S) of the field frame, and connect the belt to the drive motor pulley.",
   "Connect the slip-ring output terminals (A2, B2) to the 50V and COM terminals of the AC voltmeter.",
   "Press [RUN] to run the drive motor at 1800rpm.",
   "Observe the AC voltmeter reading and the sine wave (period and frequency) on the oscilloscope, then change the speed knob to confirm that voltage and frequency are proportional to speed."
  ],
  "expectedReadings": {
   "meter": "AC Voltmeter",
   "value": "AC 14.5V (1800rpm, no load) · frequency f = P·n/120 = 2×1800/120 = 30Hz"
  },
  "verifyLabels": [
   "AC EMF 14.5V"
  ],
  "poleLabels": {
   "P1": "N pole",
   "P5": "S pole"
  }
 },
 "GEN-03": {
  "category": "Generator Lab",
  "title": "Lab 03. DC Generator with Permanent Magnets",
  "goal": "Understand how the AC EMF induced in the armature is rectified to DC by the commutator, and observe the commutation characteristics.",
  "procedure": [
   "Install the DC Volt/Ampere Meter (08), Field Frame (10), and drive motor (11).",
   "Assemble the permanent magnets (P1: N, P5: S) and the 2-pole armature, and fit the Type-B brush holder (commutator).",
   "Wire terminals A2 (+) and B2 (−) to 50V–COM of the DC voltmeter.",
   "Press [RUN] to run at 1800rpm and confirm that the voltmeter indicates DC in one direction (+).",
   "After STOP, turn the drive motor's direction switch (DIRECTION) to CCW and run again; confirm that the polarity reverses to (−)."
  ],
  "expectedReadings": {
   "meter": "DC Voltmeter",
   "value": "DC +13.1V (CW) / −13.1V (CCW) — rectified average = (2√2/π)×14.5V = 0.9×14.5V"
  },
  "verifyLabels": [
   "Rectified DC 13.1V"
  ],
  "poleLabels": {
   "P1": "N pole",
   "P5": "S pole"
  }
 },
 "GEN-04": {
  "category": "Generator Lab",
  "title": "Lab 04. Separately Excited DC Shunt Generator",
  "goal": "Use electromagnet field windings to form the generator field, and control the induced EMF by varying the field current from an independent external power supply.",
  "procedure": [
   "Mount the AC/DC Power Supply (06), Field Rheostat (01), DC Volt/Ampere Meter (08), Field Frame (10), and drive motor (11).",
   "Install two field windings (700 turns) on poles P1 and P5, and connect the 2-pole armature and the belt.",
   "Connect the power supply's AC 12V tap to AC OUTPUT No. 2, and jumper terminals 5 and 6 (DC output approx. 15.5V).",
   "Field circuit: wire DC(+) → ammeter 1A → field rheostat 1–2 → field C1 … D1 → DC(−).",
   "Wire armature A2–B2 to 50V–COM of the DC voltmeter.",
   "Run at 1800rpm and reduce the field resistance from 100Ω → 0Ω, observing the rise in generated voltage as the field current (If) increases. Changing the direction to CCW reverses the polarity."
  ],
  "expectedReadings": {
   "meter": "DC Voltmeter / Ammeter",
   "value": "R=100Ω: If≈0.112A, V≈20.7V → R=0Ω: If≈0.391A, V≈46.0V (1800rpm, DC 15.5V excitation)"
  },
  "verifyLabels": [
   "Generated voltage 20–46V",
   "Field current 0.11–0.39A"
  ],
  "poleLabels": {
   "P1": "Field winding 1",
   "P5": "Field winding 2"
  }
 },
 "GEN-05": {
  "category": "Generator Lab",
  "title": "Lab 05. Self-Excited DC Shunt Generator",
  "goal": "Understand the construction and principle of the self-excited shunt generator, and why residual magnetism must be present in the field pole pieces for self-excitation to begin.",
  "procedure": [
   "Wire the field winding (C1–D1) through the field rheostat in parallel with the armature output (A2–B2) (A2 → terminal 1 of 01, terminal 2 of 01 → C1, D1 → B2).",
   "Connect DC voltmeter 50V–COM across A2–B2.",
   "Set the drive motor speed knob to 1000rpm and press [RUN] → confirm that only about 3V appears due to residual magnetism and the voltage does not build up.",
   "Raise the speed knob to 1800rpm and observe the voltage building up sharply (approx. 38V) once the critical speed (approx. 1300rpm at R=100Ω) is exceeded.",
   "Confirm that reducing the field resistance raises the built-up voltage (up to approx. 47V), and that reversing the rotation to CCW cancels the residual magnetism so the voltage does not build up."
  ],
  "expectedReadings": {
   "meter": "DC Voltmeter",
   "value": "1000rpm: approx. 3V (no build-up) → 1800rpm: approx. 38V (built up, R=100Ω) → R=50Ω: approx. 46.5V"
  },
  "verifyLabels": [
   "Self-excited voltage build-up"
  ],
  "poleLabels": {
   "P1": "Field winding",
   "P5": "Field winding"
  }
 },
 "GEN-06": {
  "category": "Generator Lab",
  "title": "Lab 06. No-Load Saturation of the Shunt Generator",
  "goal": "Measure the saturation characteristic curve of the induced EMF versus field current for a shunt generator at no load, and verify magnetic saturation.",
  "procedure": [
   "Wire a DC ammeter (1A) in series with the field circuit and a DC voltmeter (50V) in parallel with the armature output (A2–B2).",
   "Set the power supply to AC 12V tap → No. 2, with terminals 5–6 jumpered, to feed approx. 15.5V DC to the field.",
   "Keep the drive motor at 1800rpm.",
   "Reduce the field resistance step by step from 100Ω to 0Ω, recording the field current (If) and generated voltage (V) with [📥 Record Data].",
   "Compare the recorded points with the theoretical saturation curve on the [Results & Feedback] tab (using the 24V tap extends If to approx. 0.8A)."
  ],
  "expectedReadings": {
   "meter": "If – V saturation curve",
   "value": "E = 1.8 + 50·tanh(If/0.28) [1800rpm]: If 0.1A→18.9V, 0.2A→32.5V, 0.3A→41.3V, 0.39A→46.0V"
  },
  "verifyLabels": [
   "Saturation curve measurement range"
  ],
  "poleLabels": {
   "P1": "Field",
   "P5": "Field"
  }
 },
 "GEN-07": {
  "category": "Generator Lab",
  "title": "Lab 07. Load Characteristics of the Separately Excited DC Shunt Generator",
  "goal": "Measure the terminal-voltage drop (external characteristic curve) caused by internal resistance and armature reaction as the load current increases.",
  "procedure": [
   "Wire the separately excited field circuit: power supply (06) DC output → field rheostat → field C1–D1 (AC 12V tap → No. 2, jumper 5–6).",
   "Wire generator A2 → DC ammeter 5A → RLC load No. 1 (R+) / load No. 4 (R−) → B2, and connect the voltmeter (50V) across A2–B2.",
   "Run at 1800rpm and confirm that the no-load voltage is approx. 40V (field resistance set to 16Ω).",
   "Turn on the RLC load switches 50Ω → 30Ω → 30Ω+50Ω (18.75Ω) → 10Ω in turn, recording load current (IL) and terminal voltage (V).",
   "Observe the terminal-voltage drop with increasing load (V = E − Ia·Ra) and the drop in drive-motor speed."
  ],
  "expectedReadings": {
   "meter": "Voltmeter & Ammeter",
   "value": "No load 39.9V → 50Ω: 36.1V/0.72A → 30Ω: 34.0V/1.13A → 18.75Ω: 31.4V/1.67A → 10Ω: 26.6V/2.65A"
  },
  "verifyLabels": [
   "Terminal voltage",
   "Load current present"
  ],
  "poleLabels": {
   "P1": "Field",
   "P5": "Field"
  }
 },
 "GEN-08": {
  "category": "Generator Lab",
  "title": "Lab 08. Revolving-Field Single-Phase AC Shunt Generator",
  "goal": "Understand the construction and operating principle of the revolving-field type single-phase AC generator, and observe the AC output induced in the stator winding.",
  "procedure": [
   "Fit the salient-pole field rotor onto the shaft, and feed DC from the power supply (12V tap → approx. 15.5V) to the slip rings (C1–D1).",
   "Wire the stator output (A2–B2) to 50V–COM of the AC voltmeter.",
   "Press [RUN] to run at 1800rpm and observe the AC voltage and waveform induced in the stator winding by the revolving field."
  ],
  "expectedReadings": {
   "meter": "AC Voltmeter",
   "value": "AC 23.9V (If≈0.39A, 1800rpm) · f = 2×1800/120 = 30Hz"
  },
  "verifyLabels": [
   "AC EMF 23.9V"
  ],
  "poleLabels": {
   "P1": "Stator",
   "P5": "Stator"
  }
 },
 "GEN-09": {
  "category": "Generator Lab",
  "title": "Lab 09. Load Characteristics of the AC Generator",
  "goal": "Measure the demagnetizing effect and voltage regulation when R and L loads are connected to the output terminals of an AC generator.",
  "procedure": [
   "Supply DC excitation to the field of the revolving-field AC generator (Lab 08 configuration).",
   "Wire generator A2 → AC ammeter 5A → RLC load No. 1, load No. 4 → B2, and jumper load terminals 1–2 / 4–5 so that R and L can be used in parallel.",
   "Record the no-load voltage at 1800rpm, then turn on the 30Ω resistor (S2) and measure voltage and current.",
   "Next, also turn on the 0.4H inductor (S5), compare the voltage drop under a lagging power-factor load, and calculate the voltage regulation."
  ],
  "expectedReadings": {
   "meter": "AC Voltmeter/Ammeter",
   "value": "No load 23.9V → R 30Ω: 21.3V/0.71A → R30Ω∥L0.4H: 19.7V/0.73A (additional voltage drop with lagging load)"
  },
  "verifyLabels": [
   "Terminal voltage"
  ],
  "poleLabels": {
   "P1": "Stator",
   "P5": "Stator"
  }
 },
 "GEN-10": {
  "category": "Generator Lab",
  "title": "Lab 10. Principle of the Three-Phase Generator",
  "goal": "Use an oscilloscope to observe the principle of three-phase AC EMF generated in three stator windings displaced by 120°.",
  "procedure": [
   "Assemble the salient-pole rotor and three stator coils spaced 120° apart (P1, P4, P7).",
   "Wire the phase-A winding (A1) and the neutral (D1) to 50V–COM of the AC voltmeter.",
   "Run at 1800rpm, measure the phase voltage, and observe the 120° phase displacement of the A, B, and C phase waveforms on the oscilloscope."
  ],
  "expectedReadings": {
   "meter": "Three-phase phase voltage",
   "value": "Phase voltage 12.0V (1800rpm), 30Hz, three-phase sine waves 120° apart"
  },
  "verifyLabels": [
   "Phase voltage 12V"
  ],
  "poleLabels": {
   "P1": "Phase U",
   "P4": "Phase V",
   "P7": "Phase W"
  }
 },
 "GEN-11": {
  "category": "Generator Lab",
  "title": "Lab 11. Revolving-Field Three-Phase AC Generator (Y-Δ Load)",
  "goal": "Examine the relationship between line and phase voltage (factor of √3) for Y and Δ connections of a three-phase AC generator, and light the load lamps.",
  "procedure": [
   "Fit the Y-connected lamps (L4, L5, L6, 12V) of the Three-Phase Load Unit (04), and wire A2→U, B2→V, C2→W, D2→N.",
   "Connect the AC voltmeter between U and N (phase voltage).",
   "Run at 1800rpm and confirm that the three-phase lamps light evenly.",
   "Move the voltmeter COM lead from N to terminal V to measure the line voltage (U–V) and confirm its ratio to the phase voltage (√3). Click a lamp socket to fit or remove the bulb."
  ],
  "expectedReadings": {
   "meter": "Line / phase voltage",
   "value": "With Y load: phase voltage approx. 11.4V, line voltage approx. 19.7V (= √3 × 11.36V) — no-load EMF 12V"
  },
  "verifyLabels": [
   "Phase/line voltage"
  ],
  "poleLabels": {
   "P1": "Phase U",
   "P4": "Phase V",
   "P7": "Phase W"
  }
 },
 "GEN-12": {
  "category": "Generator Lab",
  "title": "Lab 12. Revolving-Armature Three-Phase AC Generator",
  "goal": "Observe how a revolving-armature generator delivers three-phase AC through slip rings and brushes.",
  "procedure": [
   "Assemble the revolving-armature rotor (three-phase winding + slip rings) and wire A2→U, B2→V, C2→W to the three-phase Δ load (L1, L2, L3).",
   "Connect the AC voltmeter between U and V (line voltage).",
   "Set the drive motor speed to 1000rpm and press [RUN] → check that the lamps light and read the line voltage.",
   "Confirm that raising the speed pushes the line voltage above the lamp rating (12V) and an overvoltage warning appears (textbook: do not run above 1400rpm)."
  ],
  "expectedReadings": {
   "meter": "AC line voltage",
   "value": "1000rpm: approx. 9.9V (within rating) / 1800rpm: approx. 17.6V → overvoltage on 12V lamps"
  },
  "verifyLabels": [
   "Line voltage within rating"
  ],
  "poleLabels": {
   "P1": "Field",
   "P5": "Field"
  }
 },
 "GEN-13": {
  "category": "Generator Lab",
  "title": "Lab 13. Rotary Converter",
  "goal": "Practice the operating principle of the rotary converter, a single electrical machine that takes AC input and converts it to DC.",
  "procedure": [
   "Wire the power supply's AC 24V tap and 0V to the rotary converter slip rings (A1, B1).",
   "Wire the commutator brush terminals (C2, D2) to 50V–COM of the DC voltmeter.",
   "Press [RUN] to apply power; confirm that the rotor starts up to synchronous speed and DC is delivered from the commutator side."
  ],
  "expectedReadings": {
   "meter": "DC output",
   "value": "AC 23.8V input → synchronous speed 3600rpm, DC output approx. 33.7V (≈ √2 × AC RMS value)"
  },
  "verifyLabels": [
   "DC conversion output"
  ],
  "poleLabels": {
   "P1": "Field",
   "P5": "Field"
  }
 },
 "MOT-01": {
  "category": "Motor Lab",
  "title": "Lab 01. Principle of the Motor (Fleming's Left-Hand Rule)",
  "goal": "Verify with Fleming's left-hand rule the direction of the electromagnetic force (torque) produced when current flows through a conductor placed in a magnetic field.",
  "procedure": [
   "Fit the permanent magnets (P1: N, P5: S) and the disk-slot rotor (Type-B brushes) onto the field frame.",
   "Set the power supply to AC 6V tap → No. 4 with terminals 5–6 jumpered to obtain approx. 7V DC, and wire DC(+)→A2, DC(−)→B2.",
   "Press [RUN] to apply DC and observe the direction of rotation; then reverse the wiring polarity and confirm that the direction reverses."
  ],
  "expectedReadings": {
   "meter": "Torque",
   "value": "DC 7.0V applied → starts clockwise (CW), approx. 830rpm / counterclockwise (CCW) with reversed polarity"
  },
  "verifyLabels": [
   "Motor rotation"
  ],
  "poleLabels": {
   "P1": "N pole",
   "P5": "S pole"
  }
 },
 "MOT-02": {
  "category": "Motor Lab",
  "title": "Lab 02. DC Motor with Permanent Magnets",
  "goal": "Practice the continuous-running characteristics of a DC motor with a permanent-magnet field and commutator, and the change in speed with applied voltage.",
  "procedure": [
   "Wire the power supply (6V tap → No. 4, jumper 5–6) DC(+) → DC ammeter 5A → A2, B2 → DC(−).",
   "Connect voltmeter 10V–COM across A2–B2.",
   "Press [RUN] and record voltage, current, and speed.",
   "After STOP, change the tap to 12V (→ No. 2), move the voltmeter to the 50V range, and measure again. (Do not connect the 24V tap directly: the starting current would exceed the 3A fuse.)"
  ],
  "expectedReadings": {
   "meter": "Motor speed",
   "value": "6V tap (DC 7.0V): approx. 830rpm, 0.21A / 12V tap (DC 15.4V): approx. 1870rpm, 0.40A — n = (V − Ia·Ra)/kΦ"
  },
  "verifyLabels": [
   "Speed vs. voltage"
  ],
  "poleLabels": {
   "P1": "N pole",
   "P5": "S pole"
  }
 },
 "MOT-03": {
  "category": "Motor Lab",
  "title": "Lab 03. Series Motor with Field Windings",
  "goal": "Observe the high starting torque of a series motor, in which the field winding and armature winding are connected in series, and its change in speed with load.",
  "procedure": [
   "Wire the field winding (300 turns, series field, C1–D1) in series with the armature (A2–B2), and insert the starting rheostat (02) and DC ammeter 5A in series.",
   "Power supply: 12V tap → No. 2, jumper 5–6 (DC approx. 15.5V).",
   "With the starting resistance at 50Ω (maximum), press [RUN] → measure the starting current and speed.",
   "Gradually reduce the starting resistance to 0Ω and observe the sharp rise in speed characteristic of a series motor.",
   "Confirm that reversing only the armature connection (A2↔B2) reverses the rotation, while reversing both the field and the armature leaves the direction unchanged."
  ],
  "expectedReadings": {
   "meter": "Series motor",
   "value": "Starting resistance 50Ω: starting current 0.26A, approx. 670rpm → 0Ω: approx. 1320rpm (direct-on-line starting current approx. 1.4A)"
  },
  "verifyLabels": [
   "Series motor rotation"
  ],
  "poleLabels": {
   "P1": "Series 300 turns",
   "P5": "Series 300 turns"
  }
 },
 "MOT-04": {
  "category": "Motor Lab",
  "title": "Lab 04. DC Compound Motor (Cumulative Compound)",
  "goal": "Learn the wiring and operating characteristics of a cumulative compound motor equipped with both a shunt field winding and a series field winding.",
  "procedure": [
   "Wire the shunt field (700 turns, C1–D1) through the field rheostat (01) in parallel with the DC supply, and the series field (300 turns, E1→E2) in series with the armature (A2–B2) together with the starting rheostat (02) and ammeter (cumulative compound: the fluxes of the two fields add).",
   "Press [RUN] with the field resistance at 20Ω and the starting resistance at 50Ω (maximum).",
   "Reduce the starting resistance to 0Ω and record the normal running speed and armature current.",
   "Confirm that increasing the field resistance reduces the flux and raises the speed (field-weakening control)."
  ],
  "expectedReadings": {
   "meter": "Cumulative compound",
   "value": "Starting resistance 0Ω, field resistance 20Ω: approx. 660rpm → field resistance 100Ω: approx. 940rpm (N = (V − IaRa)/KΦ)"
  },
  "verifyLabels": [
   "Compound motor rotation"
  ],
  "poleLabels": {
   "P1": "Series 300 turns",
   "P5": "Shunt 700 turns"
  }
 },
 "MOT-05": {
  "category": "Motor Lab",
  "title": "Lab 05. DC Compound Motor (Differential Compound)",
  "goal": "Practice the speed behavior and starting instability of a differential compound connection, in which the series-field flux opposes the shunt-field flux.",
  "procedure": [
   "Wire as in Lab 04, but connect the series field in reverse (E2→E1) to make a differential compound motor.",
   "With the starting resistance at 50Ω (maximum), press [RUN] → confirm that the motor runs in the normal direction at approx. 590rpm.",
   "After STOP, set the starting resistance to 0Ω and press [RUN] again (direct-on-line start): the series-field MMF from the large starting current cancels the shunt flux, and the motor becomes unstable, reversing and running at high speed."
  ],
  "expectedReadings": {
   "meter": "Differential compound",
   "value": "Starting resistance 50Ω: approx. 590rpm (CW) → direct-on-line start at 0Ω: net flux cancellation causes reverse rotation at approx. 1840rpm, current 0.72A (unstable)"
  },
  "verifyLabels": [
   "Differential compound rotation"
  ],
  "poleLabels": {
   "P1": "Series 300 turns",
   "P5": "Shunt 700 turns"
  }
 },
 "MOT-06": {
  "category": "Motor Lab",
  "title": "Lab 06. AC Commutator Motor (Universal Motor)",
  "goal": "Practice the characteristics of the universal motor, which runs on an AC supply by producing torque in the same direction as a DC series motor.",
  "procedure": [
   "With the series connection (field C1–D1 → armature A2–B2), wire the power supply AC 24V tap → AC ammeter 5A → C1, and B2 → 0V.",
   "Press [RUN] to apply AC and confirm that the motor rotates continuously in one direction.",
   "Confirm that reversing the supply polarity (wiring) keeps the direction of rotation, because the current and the flux reverse simultaneously."
  ],
  "expectedReadings": {
   "meter": "AC commutator motor",
   "value": "AC 24V: approx. 1910rpm, 0.27A — rotates in the same direction regardless of polarity"
  },
  "verifyLabels": [
   "Universal motor rotation"
  ],
  "poleLabels": {
   "P1": "Series 300 turns",
   "P5": "Series 300 turns"
  }
 },
 "MOT-07": {
  "category": "Motor Lab",
  "title": "Lab 07. Rotating Magnetic Field of the Three-Phase Induction Motor",
  "goal": "Observe the formation of a circular rotating magnetic field when three-phase AC with 120° phase displacement is applied to the stator.",
  "procedure": [
   "Wire the Pole Changing Unit (12) outputs Ua, Va, Wa to the field frame's three-phase windings A1, B1, C1 (coils P1, P4, P7, star-connected). (The simulator assumes a 60Hz three-phase supply is connected to R, S, T of the pole changing unit.)",
   "Fit the squirrel-cage rotor and press [RUN] → the pole-changing switch goes to LOW (Δ, 4-pole) and a rotating magnetic field is formed.",
   "Compare the synchronous speed Ns = 120f/P with the actual speed (slip)."
  ],
  "expectedReadings": {
   "meter": "Rotating magnetic field",
   "value": "4-pole: Ns = 120×60/4 = 1800rpm, rotor approx. 1740rpm (s = 3.3%)"
  },
  "verifyLabels": [
   "Rotation by rotating field"
  ],
  "poleLabels": {
   "P1": "U",
   "P4": "V",
   "P7": "W"
  }
 },
 "MOT-08": {
  "category": "Motor Lab",
  "title": "Lab 08. Squirrel-Cage Induction Motor",
  "goal": "Assemble a squirrel-cage rotor and practice induction-motor rotation with slip driven by a three-phase rotating magnetic field.",
  "procedure": [
   "Fit the squirrel-cage rotor onto the center shaft of the field frame.",
   "Make the three-phase connection Ua, Va, Wa → A1, B1, C1 from the pole changing unit and press [RUN] (built-in three-phase 60Hz supply assumed).",
   "Measure the rated speed and slip.",
   "After STOP, swap two lines (e.g., Ua↔Va) and confirm reverse rotation."
  ],
  "expectedReadings": {
   "meter": "Induction motor speed",
   "value": "Approx. 1740rpm (s = (1800−1740)/1800 = 3.3%); with two lines swapped, −1740rpm (reverse rotation)"
  },
  "verifyLabels": [
   "Induction motor rated rotation"
  ],
  "poleLabels": {
   "P1": "U",
   "P4": "V",
   "P7": "W"
  }
 },
 "MOT-09": {
  "category": "Motor Lab",
  "title": "Lab 09. Two-Speed Control of the Induction Motor",
  "goal": "Operate the Pole Changing Unit module to switch the stator between 2 and 4 poles, doubling the speed.",
  "procedure": [
   "Wire the pole changing unit Ua, Va, Wa → A1, B1, C1 and fit the squirrel-cage rotor.",
   "Press [RUN] → measure the speed at LOW (Δ, 4-pole).",
   "Click the pole-changing switch to go through STOP to HIGH (YY, 2-pole), and confirm that the speed roughly doubles."
  ],
  "expectedReadings": {
   "meter": "Two-speed operation",
   "value": "LOW 4-pole: Ns 1800 → 1740rpm ↔ HIGH 2-pole: Ns 3600 → 3450rpm"
  },
  "verifyLabels": [
   "Pole-changing operation"
  ],
  "poleLabels": {
   "P1": "U",
   "P4": "V",
   "P7": "W"
  }
 },
 "MOT-10": {
  "category": "Motor Lab",
  "title": "Lab 10. Repulsion Motor",
  "goal": "Practice the repulsion motor, which produces torque when single-phase AC is applied to the stator and the angle of the short-circuited armature brushes is adjusted.",
  "procedure": [
   "Wire the power supply's AC 24V tap and 0V to the stator field (C1–D1).",
   "Short-circuit the armature brush terminals (A2–B2) with a jumper wire.",
   "Press [RUN] to apply AC and confirm that the motor turns by repulsion torque; then remove the shorting jumper and confirm that the torque disappears."
  ],
  "expectedReadings": {
   "meter": "Repulsion torque",
   "value": "AC 24V, armature shorted: approx. 2400rpm / stops when the shorting jumper is removed"
  },
  "verifyLabels": [
   "Repulsion motor rotation"
  ],
  "poleLabels": {}
 },
 "MOT-11": {
  "category": "Motor Lab",
  "title": "Lab 11. Split-Phase Motor",
  "goal": "Start a single-phase induction motor by using the impedance difference between the main winding and the auxiliary (starting) winding to create a split-phase field with approximately 90° phase difference.",
  "procedure": [
   "Apply AC 24V to the main winding (A1–D1), and connect the auxiliary winding (B1–D1) to the same supply with the RLC module capacitor (terminals 3–6, 8.5μF, S7 ON) in series. Connect D1 to 0V.",
   "Press [RUN] to apply power and observe the rotating field formed by the phase difference (approx. 100°) between the main and auxiliary currents, making the motor self-starting.",
   "After STOP, set the capacitor switch (S7) to OFF and apply power again; confirm that the auxiliary-winding circuit is open and the motor cannot start."
  ],
  "expectedReadings": {
   "meter": "Capacitor start",
   "value": "8.5μF start: phase difference approx. 100° → self-starting, approx. 3420rpm (2-pole, s=5%) / capacitor OFF: cannot start"
  },
  "verifyLabels": [
   "Single-phase induction motor start"
  ],
  "poleLabels": {}
 },
 "MOT-12": {
  "category": "Motor Lab",
  "title": "Lab 12. Shaded-Pole Motor",
  "goal": "Practice the construction in which a copper loop (shading coil) wound around part of each pole delays the phase of the flux, creating a rotating field for starting.",
  "procedure": [
   "Install the poles fitted with shading coils and fit the squirrel-cage rotor.",
   "Wire the AC 24V tap and 0V to the pole winding (C1–D1).",
   "Press [RUN] to apply AC and confirm that the rotor turns, driven by the field moving from the main pole toward the shaded pole."
  ],
  "expectedReadings": {
   "meter": "Shaded-pole motor",
   "value": "AC 24V: approx. 3060rpm (2-pole, 15% slip — typical of small fan motors with low efficiency and torque)"
  },
  "verifyLabels": [
   "Shaded-pole motor rotation"
  ],
  "poleLabels": {}
 }
};

export const PRACTICE_QUESTIONS_EN = [
 {
  "id": "q1",
  "category": "Basic Electromagnetic Theory",
  "question": "In a generator, when a conductor rotates in a magnetic field and cuts magnetic flux, which rule determines the direction of the EMF (current) induced in the conductor?",
  "options": [
   "Fleming's Right-Hand Rule",
   "Fleming's Left-Hand Rule",
   "Ampère's Right-Hand Grip Rule",
   "Coulomb's Law"
  ],
  "correctIndex": 0,
  "explanation": "The direction of the induced EMF and induced current in a generator follows Fleming's right-hand rule (remember: right hand for generators, left hand for motors). The thumb points in the direction of conductor motion (F/v), the index finger in the direction of the magnetic field (B), and the middle finger in the direction of the induced EMF (e/I)."
 },
 {
  "id": "q2",
  "category": "DC Generators",
  "question": "Which of the following is NOT one of the three conditions a self-excited shunt generator must satisfy to build up its own voltage without an external supply?",
  "options": [
   "A small amount of residual magnetism must remain in the field core.",
   "The generator must rotate in the direction that reinforces the residual magnetism.",
   "The total resistance of the field circuit must be less than the critical resistance.",
   "The field rheostat must be set to its maximum value to maintain infinite resistance."
  ],
  "correctIndex": 3,
  "explanation": "If the field-circuit resistance exceeds the critical resistance, the flux-increasing feedback loop cannot form and the voltage does not build up. The field resistance must therefore be kept well below the critical resistance (i.e., kept low) for voltage build-up to succeed."
 },
 {
  "id": "q3",
  "category": "Generator Characteristic Curves",
  "question": "Which statement best describes the no-load saturation curve of a DC generator?",
  "options": [
   "It shows how the induced EMF (E) at the terminals saturates as the field current (If) increases at rated speed.",
   "It shows the drop in terminal voltage (V) as the load current (IL) increases.",
   "It shows the quadratic increase in torque as armature current increases.",
   "It shows the generator's mechanical efficiency as speed varies."
  ],
  "correctIndex": 0,
  "explanation": "The no-load saturation curve shows the EMF (E) as the field current (If) is increased from zero with no load and constant speed: it first follows the air-gap line (straight), then bends gradually as the iron core saturates magnetically."
 },
 {
  "id": "q4",
  "category": "Generator Load Characteristics",
  "question": "In a DC shunt generator, when the resistor switches on the R/L/C Load Unit (IEG-6030-05) are turned on and the load current (IL) increases, which of the following is NOT one of the three main causes of the terminal-voltage drop?",
  "options": [
   "Voltage drop across the internal resistance of the armature winding (Ia * Ra)",
   "Demagnetizing armature reaction caused by the load-current flux",
   "Secondary flux reduction as the shunt field current (If = V/Rf) falls with the terminal voltage",
   "Unlimited runaway of the prime-mover speed due to loss of electromagnetic coupling with the drive motor"
  ],
  "correctIndex": 3,
  "explanation": "The causes of voltage drop in a shunt generator are ① the voltage drop across the armature winding resistance (Ia*Ra), ② demagnetization of the main flux by armature reaction, and ③ the reduction in shunt field current (If) as the terminal voltage falls. Runaway of the prime-mover speed is not a cause of the voltage drop."
 },
 {
  "id": "q5",
  "category": "Armature Reaction",
  "question": "In a DC machine under load, what is the most ideal device for fundamentally cancelling armature reaction by embedding conductors in the main pole faces and passing current opposite to the armature current?",
  "options": [
   "Compensating winding",
   "Brush rocker",
   "Slip ring",
   "Starting rheostat"
  ],
  "correctIndex": 0,
  "explanation": "A compensating winding places conductors in slots in the main pole faces and carries current in the opposite direction, in series with the armature, cancelling the armature MMF most directly and completely (100%). Interpoles are installed between the main poles to suppress commutation sparking."
 },
 {
  "id": "q6",
  "category": "DC Motors",
  "question": "When starting a DC motor, what is the decisive reason for applying power with the starting rheostat (IEG-6030-02) set to its maximum resistance?",
  "options": [
   "At standstill the back EMF is 0V (Ec = 0), so it prevents a dangerously large starting current (V/Ra), many times rated, from burning out the windings",
   "To accelerate instantly to over 10,000 rpm at start",
   "To completely demagnetize (degauss) the residual magnetism of the field core",
   "To correct the power factor of the load current to 1.0"
  ],
  "correctIndex": 0,
  "explanation": "At standstill a DC motor has back EMF Ec = 0, so only the armature resistance Ra limits the current. Ra is very small (a few Ω on the trainer, under 1Ω on large machines), so applying voltage V directly causes a current 10–20 times rated to flow and burn out the windings. The starting resistance must therefore be inserted in series at its maximum to safely limit the starting current."
 },
 {
  "id": "q7",
  "category": "DC Motor Speed Control",
  "question": "While a DC shunt motor is running, how does its speed change if the knob of the field rheostat (IEG-6030-01) is turned to increase the resistance (Rf)?",
  "options": [
   "The field current (If) and flux (Φ) decrease, so by the back-EMF relation N = (V - IaRa)/(KΦ) the speed increases.",
   "The larger field resistance makes the torque infinite and the speed immediately drops to 0 rpm.",
   "The applied supply voltage drops to 0V and the circuit breaker trips.",
   "The direction of rotation immediately reverses from clockwise to counterclockwise."
  ],
  "correctIndex": 0,
  "explanation": "From the DC motor speed equation N = (V - IaRa) / (K * Φ), increasing the field resistance reduces the field current If and the flux Φ, so the speed N rises. This is called field-weakening speed control."
 },
 {
  "id": "q8",
  "category": "Synchronous Machine Theory",
  "question": "What is the synchronous speed (Ns) of a 4-pole (P=4) synchronous generator connected to a 60Hz three-phase AC supply?",
  "options": [
   "1,800 rpm",
   "3,600 rpm",
   "1,200 rpm",
   "900 rpm"
  ],
  "correctIndex": 0,
  "explanation": "The synchronous speed formula is Ns = 120 * f / P. With frequency f = 60Hz and number of poles P = 4, Ns = 120 * 60 / 4 = 7,200 / 4 = 1,800 rpm."
 },
 {
  "id": "q9",
  "category": "Induction Motors",
  "question": "Which statement about the slip (s) of a three-phase squirrel-cage induction motor is correct?",
  "options": [
   "Slip s = (Ns - N) / Ns, and at normal full-load operation it is typically a small value of about 2–5% (0.02–0.05).",
   "Slip is 0 at the instant of starting, when the motor is at standstill.",
   "Slip is 1 when the motor rotates exactly at synchronous speed (Ns).",
   "When slip becomes 0, the induced EMF and torque reach their maximum."
  ],
  "correctIndex": 0,
  "explanation": "Slip s = (Ns - N) / Ns. At standstill (N=0), s = 1 (100%); in normal operation, s = 0.02–0.05 (2–5%). If the rotor reaches synchronous speed (N=Ns), s = 0, the rotor no longer cuts flux, and the EMF and torque become 0."
 },
 {
  "id": "q10",
  "category": "Pole-Changing Control",
  "question": "When the IEG-6030-12 pole changing unit is switched from LOW (Δ, 4-pole) to HIGH (YY, 2-pole) on a 60Hz supply, how does the synchronous speed change?",
  "options": [
   "The synchronous speed doubles, from 1,800 rpm to 3,600 rpm.",
   "The synchronous speed halves, from 3,600 rpm to 1,800 rpm.",
   "The speed does not change at all, because the frequency remains 60Hz even though the number of poles changes.",
   "The rotating magnetic field disappears and the motor immediately reverses."
  ],
  "correctIndex": 0,
  "explanation": "Synchronous speed Ns = 120f / P. With 4 poles, Ns = 120×60/4 = 1,800 rpm; with 2 poles, Ns = 120×60/2 = 3,600 rpm. Halving the number of poles doubles the synchronous speed. (Lab 09: actual speeds including slip are approx. 1,740 ↔ 3,450 rpm.)"
 }
];
