import React, { useState } from 'react';
import './Wellness.css';

const Wellness = () => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [breathingStep, setBreathingStep] = useState(0);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);

  const affirmations = [
    "I am worthy of love and respect.",
    "I choose to be kind to myself today.",
    "I am capable of handling whatever comes my way.",
    "I deserve happiness and peace.",
    "I am growing stronger every day.",
    "I trust in my ability to make positive changes.",
    "I am grateful for the good things in my life.",
    "I choose to focus on what I can control.",
    "I am enough just as I am.",
    "I deserve to take care of myself."
  ];

  const breathingExercises = [
    {
      name: "4-7-8 Breathing",
      description: "A calming technique to reduce anxiety and stress",
      steps: [
        "Find a comfortable seated position and relax your shoulders",
        "Place the tip of your tongue behind your upper front teeth",
        "Inhale quietly through your nose for 4 seconds",
        "Hold your breath for 7 seconds",
        "Exhale completely through your mouth for 8 seconds, making a whoosh sound",
        "Repeat this cycle 4 times"
      ]
    },
    {
      name: "Box Breathing",
      description: "Equal breathing pattern used by Navy SEALs for focus",
      steps: [
        "Inhale through your nose for 4 seconds",
        "Hold your breath for 4 seconds",
        "Exhale through your mouth for 4 seconds",
        "Hold your breath for 4 seconds",
        "Repeat this square pattern 4-5 times"
      ]
    },
    {
      name: "Simple Deep Breathing",
      description: "Basic relaxation technique for instant calm",
      steps: [
        "Sit comfortably with your back straight",
        "Place one hand on chest, other on belly",
        "Breathe slowly through your nose, feel belly rise",
        "Exhale slowly through your mouth, feel belly fall",
        "Continue this natural rhythm for 5-10 breaths"
      ]
    }
  ];

  const meditationScripts = [
    {
      title: "Body Scan Meditation",
      duration: "10 min",
      description: "Release tension by scanning your body"
    },
    {
      title: "Loving-Kindness Meditation",
      duration: "15 min",
      description: "Cultivate compassion for yourself and others"
    },
    {
      title: "Mindful Breathing",
      duration: "8 min",
      description: "Focus on your breath to center your mind"
    }
  ];

  const wellnessTips = [
    { icon: "🌬️", text: "Practice deep breathing when feeling anxious" },
    { icon: "🚶", text: "Take a short 10-minute walk daily" },
    { icon: "🙏", text: "Write down three things you're grateful for" },
    { icon: "👨‍👩‍👧", text: "Connect with loved ones regularly" },
    { icon: "😴", text: "Prioritize 7-9 hours of quality sleep" },
    { icon: "💧", text: "Stay hydrated throughout the day" },
    { icon: "🧘", text: "Practice mindfulness in daily activities" },
    { icon: "📱", text: "Take breaks from screens every hour" }
  ];

  const startBreathingExercise = (exercise) => {
    setCurrentExercise(exercise);
    setBreathingStep(0);
  };

  const nextBreathingStep = () => {
    if (currentExercise && breathingStep < currentExercise.steps.length - 1) {
      setBreathingStep(breathingStep + 1);
    } else {
      setCurrentExercise(null);
      setBreathingStep(0);
    }
  };

  const getNewAffirmation = () => {
    setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
  };

  return (
    <div className="wellness-page">
      <div className="wellness-hero">
        <div className="wellness-hero-content">
          <div className="wellness-hero-text">
            <h1>Wellness Sanctuary</h1>
            <p>Nurture your mind, body, and soul with mindful practices designed to bring peace and balance to your life</p>
          </div>
          <div className="wellness-hero-visual">
            <div className="wellness-orb wellness-orb-1"></div>
            <div className="wellness-orb wellness-orb-2"></div>
            <div className="wellness-lotus">🧘</div>
          </div>
        </div>
      </div>

      <div className="wellness-grid-modern">
        <div className="wellness-card-modern" style={{ animationDelay: '0.1s' }}>
          <div className="wellness-card-header">
            <span className="wellness-card-icon">💖</span>
            <h2>Daily Affirmation</h2>
          </div>
          <p className="wellness-card-subtitle">Start your day with positive self-talk</p>
          <div className="affirmation-display">
            <p className="affirmation-text-modern">"{affirmations[currentAffirmation]}"</p>
          </div>
          <button className="affirmation-btn" onClick={getNewAffirmation}>
            ✨ New Affirmation
          </button>
        </div>

        <div className="wellness-card-modern" style={{ animationDelay: '0.2s' }}>
          <div className="wellness-card-header">
            <span className="wellness-card-icon">🌬️</span>
            <h2>Breathing Exercises</h2>
          </div>
          <p className="wellness-card-subtitle">Calm your mind with guided breathing</p>
          {currentExercise ? (
            <div className="breathing-exercise-display">
              <h3 className="breathing-exercise-name">{currentExercise.name}</h3>
              <p className="breathing-exercise-desc">{currentExercise.description}</p>
              <div className="breathing-step-display">
                <p className="breathing-step-text">{currentExercise.steps[breathingStep]}</p>
              </div>
              <div className="breathing-progress">
                {currentExercise.steps.map((_, index) => (
                  <div key={index} className={`breathing-dot ${index <= breathingStep ? 'active' : ''}`}></div>
                ))}
              </div>
              <button className="breathing-btn" onClick={nextBreathingStep}>
                {breathingStep < currentExercise.steps.length - 1 ? 'Next Step →' : 'Complete Exercise ✓'}
              </button>
            </div>
          ) : (
            <div className="breathing-options">
              {breathingExercises.map((exercise, index) => (
                <button
                  key={index}
                  className="breathing-option-btn"
                  onClick={() => startBreathingExercise(exercise)}
                >
                  <strong>{exercise.name}</strong> • {exercise.description}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="wellness-card-modern" style={{ animationDelay: '0.3s' }}>
          <div className="wellness-card-header">
            <span className="wellness-card-icon">🧘‍♀️</span>
            <h2>Guided Meditation</h2>
          </div>
          <p className="wellness-card-subtitle">Find inner peace through mindfulness</p>
          <div className="meditation-list-modern">
            {meditationScripts.map((meditation, index) => (
              <div key={index} className="meditation-item-modern">
                <div className="meditation-item-header">
                  <span className="meditation-item-title">{meditation.title}</span>
                  <span className="meditation-duration">{meditation.duration}</span>
                </div>
                <p className="meditation-item-desc">{meditation.description}</p>
                <button className="meditation-start-btn">▶ Start Session</button>
              </div>
            ))}
          </div>
        </div>

        <div className="wellness-card-modern" style={{ animationDelay: '0.4s' }}>
          <div className="wellness-card-header">
            <span className="wellness-card-icon">💡</span>
            <h2>Wellness Tips</h2>
          </div>
          <p className="wellness-card-subtitle">Small habits for big changes</p>
          <div className="tips-list-modern">
            {wellnessTips.map((tip, index) => (
              <div key={index} className="tip-item">
                <span className="tip-icon">{tip.icon}</span>
                <p className="tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="crisis-section-modern">
        <div className="crisis-header">
          <span className="crisis-header-icon">🚨</span>
          <h2>Crisis Support</h2>
        </div>
        <p className="crisis-description">
          If you're experiencing a mental health crisis or having thoughts of self-harm, please reach out for immediate help. You are not alone.
        </p>
        <div className="crisis-contacts-grid">
          <div className="crisis-contact-card">
            <p className="crisis-contact-name">National Suicide Prevention Lifeline (India)</p>
            <p className="crisis-contact-number">📞 14416</p>
          </div>
          <div className="crisis-contact-card">
            <p className="crisis-contact-name">Crisis Text Line</p>
            <p className="crisis-contact-number">💬 Text HOME to 741741</p>
          </div>
          <div className="crisis-contact-card">
            <p className="crisis-contact-name">Emergency Services</p>
            <p className="crisis-contact-number">🚑 Call 108</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellness;