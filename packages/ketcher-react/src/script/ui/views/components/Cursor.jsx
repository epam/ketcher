import { useState, useEffect } from 'react';

const Cursor = ({ Icon, PressedIcon, enableHandTool }) => {
  const [position, setPosition] = useState({
    clientX: 50,
    clientY: 50,
  });

  const [mousedown, setMouseDown] = useState(false);

  const updatePosition = (event) => {
    const { clientX, clientY } = event;

    setPosition({
      clientX,
      clientY,
    });
  };
  const handleMouseDown = () => {
    setMouseDown(true);
  };
  const handleMouseUp = () => {
    setMouseDown(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', updatePosition, false);
    document.addEventListener('mouseenter', updatePosition, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', updatePosition);
    };
  }, []);

  if (!enableHandTool) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {mousedown ? (
        <PressedIcon
          style={{
            position: 'absolute',
            left: position.clientX,
            top: position.clientY,
          }}
        />
      ) : (
        <Icon
          style={{
            position: 'absolute',
            left: position.clientX,
            top: position.clientY,
          }}
        />
      )}
    </div>
  );
};

export default Cursor;
