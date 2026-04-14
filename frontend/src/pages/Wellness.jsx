import React, { useState } from 'react';

const Wellness = () => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [breathingStep, setBreathingStep] = useState(0);

  const affirmations = [
    "I am worthy of love and respect.",
    "I choose to be kind to myself today.",
    "I am capable of handling whatever comes my way.",
    "I deserve happiness and peace.",
    "I am growing stronger every day.",
    "I trust in my ability to make positive changes.",
    "I am grateful for the good things in my life.",
    "I choose to focus on what I can control."
  ];

  const breathingExercises = [
    {
      name: "4-7-8 Breathing",
      description: "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.",
      steps: [
        "Find a comfortable seated position",
        "Place your tongue behind your front teeth",
        "Inhale quietly through your nose for 4 seconds",
        "Hold your breath for 7 seconds",
        "Exhale completely through your mouth for 8 seconds",
        "Repeat 4 times"
      ]
    },
    {
      name: "Box Breathing",
      description: "Equal time for inhale, hold, exhale, and hold.",
      steps: [
        "Inhale for 4 seconds",
        "Hold for 4 seconds",
        "Exhale for 4 seconds",
        "Hold for 4 seconds",
        "Repeat 4-5 times"
      ]
    }
  ];

  const meditationScripts = [
    {
      title: "Body Scan Meditation",
      duration: "10 minutes",
      script: "Find a comfortable position... Close your eyes and take a deep breath... Bring your attention to your toes..."
    },
    {
      title: "Loving-Kindness Meditation",
      duration: "15 minutes",
      script: "Sit comfortably... Close your eyes... Begin by wishing yourself well..."
    }
  ];

  const startBreathingExercise = (exercise) => {
    setCurrentExercise(exercise);
    setBreathingStep(0);
  };

  const nextBreathingStep = () => {
    if (breathingStep < currentExercise.steps.length - 1) {
      setBreathingStep(breathingStep + 1);
    } else {
      setCurrentExercise(null);
      setBreathingStep(0);
    }
  };

  return (
    <div className="wellness-page">
      <div className="page-header">
        <h1>Wellness Tools</h1>
        <p>Access tools and exercises to support your mental well-being.</p>
      </div>

      <div className="wellness-grid">
        <div className="wellness-card">
          <h3>🌸 Daily Affirmation</h3>
          <p className="affirmation-text">
            {affirmations[Math.floor(Math.random() * affirmations.length)]}
          </p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Get New Affirmation
          </button>
        </div>

        <div className="wellness-card">
          <h3>🫁 Breathing Exercises</h3>
          {currentExercise ? (
            <div className="breathing-exercise">
              <h4>{currentExercise.name}</h4>
              <p>{currentExercise.description}</p>
              <div className="breathing-step">
                <p>{currentExercise.steps[breathingStep]}</p>
              </div>
              <button className="btn-primary" onClick={nextBreathingStep}>
                {breathingStep < currentExercise.steps.length - 1 ? 'Next Step' : 'Finish'}
              </button>
            </div>
          ) : (
            <div>
              <p>Choose a breathing exercise to begin:</p>
              {breathingExercises.map((exercise, index) => (
                <button
                  key={index}
                  className="btn-secondary exercise-btn"
                  onClick={() => startBreathingExercise(exercise)}
                >
                  {exercise.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="wellness-card">
          <h3>🧘 Guided Meditation</h3>
          <div className="meditation-list">
            {meditationScripts.map((meditation, index) => (
              <div key={index} className="meditation-item">
                <h4>{meditation.title}</h4>
                <p>Duration: {meditation.duration}</p>
                <button className="btn-primary small">Start Meditation</button>
              </div>
            ))}
          </div>
        </div>

        <div className="wellness-card">
          <h3>📊 Wellness Tips</h3>
          <ul className="tips-list">
            <li>Practice deep breathing when feeling anxious</li>
            <li>Take short walks in nature</li>
            <li>Write down three things you're grateful for daily</li>
            <li>Connect with loved ones regularly</li>
            <li>Get adequate sleep (7-9 hours)</li>
            <li>Stay hydrated throughout the day</li>
            <li>Practice mindfulness during routine activities</li>
            <li>Limit screen time before bed</li>
          </ul>
        </div>
      </div>

      <div className="emergency-section">
        <h3>🚨 Crisis Support</h3>
        <p>If you're experiencing a mental health crisis, please reach out for immediate help:</p>
        <div className="emergency-contacts">
          <div className="emergency-contact">
            <strong>National Suicide Prevention Lifeline</strong>
            <p>Call: 14416 (IN)</p>
          </div>
          <div className="emergency-contact">
            <strong>Crisis Text Line</strong>
            <p>Text: HOME to 741741</p>
          </div>
          <div className="emergency-contact">
            <strong>Emergency Services</strong>
            <p>Call: 108</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellness;