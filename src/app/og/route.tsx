import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 72,
            color: '#F5F5F5',
            letterSpacing: '-2px',
          }}
        >
          Vesto
        </div>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 24,
            color: '#737373',
            marginTop: 16,
          }}
        >
          Akıllı Moda Asistanı
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
