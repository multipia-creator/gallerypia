// ============================================
// Email Utility Functions (SendGrid Web API)
// ============================================

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  from?: string;
  fromName?: string;
  subject: string;
  html: string;
  text: string;
}

// SendGrid API를 사용하여 이메일 발송
export async function sendEmail(
  apiKey: string | undefined,
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string }> {
  // API Key가 없으면 로그만 출력 (개발 환경)
  if (!apiKey || apiKey === 'not-configured') {
    console.log('[EMAIL SIMULATION]', {
      to: options.to,
      subject: options.subject,
      preview: options.text.substring(0, 100)
    });
    return { success: true };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: options.to,
                name: options.toName || options.to
              }
            ],
            subject: options.subject
          }
        ],
        from: {
          email: options.from || 'noreply@gallerypia.com',
          name: options.fromName || 'GALLERYPIA'
        },
        content: [
          {
            type: 'text/plain',
            value: options.text
          },
          {
            type: 'text/html',
            value: options.html
          }
        ]
      })
    });

    if (response.ok || response.status === 202) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('SendGrid API Error:', errorText);
      return { success: false, error: `SendGrid error: ${response.status}` };
    }
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// 이메일 템플릿들
// ============================================

// 웰컴 이메일
export function getWelcomeEmail(userName: string): EmailTemplate {
  return {
    subject: '🎨 갤러리피아에 오신 것을 환영합니다!',
    html: `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .content { background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 40px; }
          h1 { color: #fff; font-size: 28px; margin-bottom: 20px; }
          p { color: #9ca3af; line-height: 1.8; margin-bottom: 16px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 20px; }
          .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
          .feature { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 20px; border-radius: 12px; }
          .feature-icon { font-size: 32px; margin-bottom: 10px; }
          .feature-title { color: #fff; font-weight: 600; margin-bottom: 8px; }
          .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GALLERYPIA</div>
            <p style="color: #6b7280; margin-top: 8px;">NFT Art Museum Platform</p>
          </div>
          
          <div class="content">
            <h1>안녕하세요, ${userName}님! 🎉</h1>
            <p>갤러리피아에 가입해 주셔서 감사합니다. NFT 미술품 가치산정 플랫폼에서 특별한 경험을 시작하세요.</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">🎨</div>
                <div class="feature-title">프리미엄 갤러리</div>
                <p style="font-size: 14px;">검증된 NFT 작품 감상</p>
              </div>
              <div class="feature">
                <div class="feature-icon">📊</div>
                <div class="feature-title">과학적 평가</div>
                <p style="font-size: 14px;">5개 모듈 가치산정</p>
              </div>
              <div class="feature">
                <div class="feature-icon">💎</div>
                <div class="feature-title">NFT 민팅</div>
                <p style="font-size: 14px;">작품을 NFT로 변환</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🏆</div>
                <div class="feature-title">아티스트 랭킹</div>
                <p style="font-size: 14px;">전문가 네트워크</p>
              </div>
            </div>
            
            <a href="https://gallerypia.pages.dev/gallery" class="cta-button">갤러리 둘러보기 →</a>
          </div>
          
          <div class="footer">
            <p>© 2025 GALLERYPIA. All rights reserved.</p>
            <p><a href="https://gallerypia.pages.dev/unsubscribe" style="color: #6b7280; text-decoration: none;">이메일 수신 거부</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
안녕하세요, ${userName}님!

갤러리피아에 가입해 주셔서 감사합니다.
NFT 미술품 가치산정 플랫폼에서 특별한 경험을 시작하세요.

주요 기능:
- 🎨 프리미엄 갤러리: 검증된 NFT 작품 감상
- 📊 과학적 평가: 5개 모듈 가치산정
- 💎 NFT 민팅: 작품을 NFT로 변환
- 🏆 아티스트 랭킹: 전문가 네트워크

갤러리 둘러보기: https://gallerypia.pages.dev/gallery

© 2025 GALLERYPIA
이메일 수신 거부: https://gallerypia.pages.dev/unsubscribe
    `
  };
}

// 구매 확인 이메일
export function getPurchaseConfirmationEmail(
  userName: string,
  artworkTitle: string,
  artistName: string,
  price: number,
  transactionId: string
): EmailTemplate {
  return {
    subject: '✅ 구매가 완료되었습니다',
    html: `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .content { background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 40px; }
          h1 { color: #10b981; font-size: 28px; margin-bottom: 20px; }
          .artwork-info { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 24px; border-radius: 12px; margin: 24px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .info-label { color: #9ca3af; }
          .info-value { color: #fff; font-weight: 600; }
          .price { font-size: 32px; color: #10b981; font-weight: 900; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h1>🎉 구매가 완료되었습니다!</h1>
            <p style="color: #9ca3af;">안녕하세요, ${userName}님. NFT 작품 구매가 성공적으로 완료되었습니다.</p>
            
            <div class="artwork-info">
              <div class="info-row">
                <span class="info-label">작품명</span>
                <span class="info-value">${artworkTitle}</span>
              </div>
              <div class="info-row">
                <span class="info-label">아티스트</span>
                <span class="info-value">${artistName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">거래 ID</span>
                <span class="info-value">${transactionId}</span>
              </div>
              <div class="info-row" style="margin-top: 20px; border-top: 1px solid rgba(16, 185, 129, 0.3); padding-top: 20px;">
                <span class="info-label">결제 금액</span>
                <span class="price">₩${price.toLocaleString()}</span>
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px;">구매하신 NFT는 마이페이지에서 확인하실 수 있습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 구매가 완료되었습니다!

안녕하세요, ${userName}님.
NFT 작품 구매가 성공적으로 완료되었습니다.

작품 정보:
- 작품명: ${artworkTitle}
- 아티스트: ${artistName}
- 거래 ID: ${transactionId}
- 결제 금액: ₩${price.toLocaleString()}

구매하신 NFT는 마이페이지에서 확인하실 수 있습니다.
https://gallerypia.pages.dev/profile
    `
  };
}

// 가격 변동 알림
export function getPriceChangeEmail(
  userName: string,
  artworkTitle: string,
  oldPrice: number,
  newPrice: number,
  changePercent: number
): EmailTemplate {
  const isIncrease = newPrice > oldPrice;
  const emoji = isIncrease ? '📈' : '📉';
  const color = isIncrease ? '#10b981' : '#ef4444';
  
  return {
    subject: `${emoji} ${artworkTitle} 가격 변동 알림`,
    html: `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .content { background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid ${color}40; border-radius: 16px; padding: 40px; }
          h1 { color: ${color}; font-size: 28px; margin-bottom: 20px; }
          .price-box { background: ${color}20; border: 1px solid ${color}40; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
          .old-price { color: #9ca3af; text-decoration: line-through; font-size: 18px; }
          .new-price { color: ${color}; font-size: 36px; font-weight: 900; margin: 10px 0; }
          .change { color: ${color}; font-size: 20px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h1>${emoji} 가격 변동 알림</h1>
            <p style="color: #9ca3af;">안녕하세요, ${userName}님. 관심 작품의 가격이 변동되었습니다.</p>
            
            <div class="price-box">
              <h2 style="color: #fff; margin-bottom: 16px;">${artworkTitle}</h2>
              <div class="old-price">₩${oldPrice.toLocaleString()}</div>
              <div class="new-price">₩${newPrice.toLocaleString()}</div>
              <div class="change">${isIncrease ? '+' : ''}${changePercent.toFixed(1)}%</div>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px;">지금 바로 작품을 확인해보세요!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${emoji} 가격 변동 알림

안녕하세요, ${userName}님.
관심 작품의 가격이 변동되었습니다.

작품: ${artworkTitle}
이전 가격: ₩${oldPrice.toLocaleString()}
현재 가격: ₩${newPrice.toLocaleString()}
변동률: ${isIncrease ? '+' : ''}${changePercent.toFixed(1)}%

지금 바로 작품을 확인해보세요!
    `
  };
}

// 평가 완료 알림
export function getEvaluationCompleteEmail(
  userName: string,
  artworkTitle: string,
  finalScore: number,
  estimatedValue: number
): EmailTemplate {
  return {
    subject: '⭐ 작품 평가가 완료되었습니다',
    html: `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .content { background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 40px; }
          h1 { color: #8b5cf6; font-size: 28px; margin-bottom: 20px; }
          .score-box { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 32px; border-radius: 12px; text-align: center; margin: 24px 0; }
          .score { font-size: 64px; font-weight: 900; color: #8b5cf6; margin: 16px 0; }
          .value { font-size: 28px; color: #10b981; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h1>⭐ 작품 평가가 완료되었습니다</h1>
            <p style="color: #9ca3af;">안녕하세요, ${userName}님. "${artworkTitle}" 작품의 가치평가가 완료되었습니다.</p>
            
            <div class="score-box">
              <h2 style="color: #fff; margin-bottom: 8px;">${artworkTitle}</h2>
              <div class="score">${finalScore}점</div>
              <div style="color: #9ca3af; margin: 16px 0;">예상 가치</div>
              <div class="value">₩${estimatedValue.toLocaleString()}</div>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px;">상세한 평가 결과는 작품 페이지에서 확인하실 수 있습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
⭐ 작품 평가가 완료되었습니다

안녕하세요, ${userName}님.
"${artworkTitle}" 작품의 가치평가가 완료되었습니다.

평가 점수: ${finalScore}점
예상 가치: ₩${estimatedValue.toLocaleString()}

상세한 평가 결과는 작품 페이지에서 확인하실 수 있습니다.
    `
  };
}
