import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import CreateSessionForm from './components/CreateSessionForm';
import ActiveSession from './components/ActiveSession';
import useCreateSessionController from './hooks/useCreateSessionController';

const CreateSession = ({ classId, onSessionCreated }) => {
  const controller = useCreateSessionController({ classId, onSessionCreated });

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!controller.session ? (
          <Motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <CreateSessionForm
              courses={controller.courses}
              courseLoading={controller.courseLoading}
              selectedClassId={controller.selectedClassId}
              setSelectedClassId={controller.setSelectedClassId}
              durationMinutes={controller.durationMinutes}
              setDurationMinutes={controller.setDurationMinutes}
              MAX_SESSION_DURATION_MINUTES={controller.maxSessionDurationMinutes}
              loading={controller.loading}
              createSession={controller.createSession}
              error={controller.error}
            />
          </Motion.div>
        ) : (
          <Motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <ActiveSession
              session={controller.session}
              timeRemaining={controller.timeRemaining}
              endSession={controller.endSession}
              extendSession={controller.extendSession}
              regenerateSession={controller.regenerateSession}
              formatTime={controller.formatTime}
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateSession;
