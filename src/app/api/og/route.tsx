import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Sion Wilks'
    const description = searchParams.get('description') || 'Philosophical Software Engineer'
    const type = searchParams.get('type') || 'default'
    const formula = searchParams.get('formula')
    const concept = searchParams.get('concept')

    // Math-specific template
    if (type === 'math' && formula) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f0f23',
              color: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              padding: '60px',
            }}
          >
            {/* Main formula display */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                marginBottom: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                fontFamily: 'serif',
              }}
            >
              {formula}
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                marginBottom: '30px',
                textAlign: 'center',
                maxWidth: '900px',
                color: 'white',
              }}
            >
              {title}
            </h1>
            
            {/* Concept highlight if provided */}
            {concept && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  marginBottom: '40px',
                  padding: '12px 24px',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                {concept}
              </div>
            )}
            
            {/* Author */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                SW
              </div>
              sionwilks.com
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      )
    }

    // Default template (existing code)
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f0f23',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1e1e3f 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e1e3f 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: '1000px',
            }}
          >
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                marginBottom: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '28px',
                lineHeight: '1.4',
                color: '#94a3b8',
                marginBottom: '60px',
                maxWidth: '800px',
              }}
            >
              {description}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '24px',
                color: '#64748b',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  marginRight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                SW
              </div>
              sionwilks.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
