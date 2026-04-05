export default function AnimatedBackground() {
  return (
    <>
      {/* Aurora gradient layer */}
      <div className="aurora-bg" />

      {/* Cyber grid overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.4,
        }}
        className="cyber-grid"
      />

      {/* Floating orbs — pure CSS */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 106, 255, 0.06), transparent 70%)',
          top: '10%',
          left: '-5%',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.05), transparent 70%)',
          bottom: '10%',
          right: '-5%',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 61, 113, 0.04), transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'float 12s ease-in-out infinite',
        }} />
      </div>
    </>
  )
}
