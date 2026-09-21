import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

// Mô phỏng phong cách văn bản luật chính thức (không phải ảnh chụp PDF thật — dựng bằng
// CSS để đảm bảo chữ luôn rõ nét, đúng 100% nội dung trích dẫn, không phụ thuộc công cụ
// chuyển PDF sang ảnh). Dùng cho các cảnh "Cách 1 — Đúng pháp luật" cần trích dẫn Điều/Khoản
// cụ thể, tăng cảm giác uy tín/có căn cứ cho khán giả.
export const SingleLawDocument: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const slideUp = spring({ frame, fps, config: { damping: 14 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 70 }}>
            <div style={{
                backgroundColor: '#F5F0E6',
                borderRadius: 16,
                padding: '70px 60px',
                width: '100%',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                opacity: slideUp,
                transform: `translateY(${interpolate(slideUp, [0, 1], [40, 0])}px)`,
            }}>
                <div style={{ textAlign: 'center', fontFamily: 'serif', color: '#1a1a1a' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div style={{ fontSize: 22, fontStyle: 'italic', marginTop: 4 }}>
                        Độc lập - Tự do - Hạnh phúc
                    </div>
                </div>
                <div style={{ borderTop: '2px solid #999', margin: '32px 0 28px' }} />
                <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#7A5C00',
                    letterSpacing: 2,
                    marginBottom: 20,
                    textAlign: 'center',
                }}>
                    CĂN CỨ PHÁP LÝ
                </div>
                <div style={{
                    fontSize: 42,
                    lineHeight: 1.5,
                    color: '#1a1a1a',
                    fontFamily: 'serif',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap',
                }}>
                    <RichText text={content.law_text || content.headline || 'Nội dung trích dẫn'} brandAccent="#7A5C00" themeType="headline" />
                </div>
                {content.law_citation && (
                    <div style={{
                        fontSize: 28,
                        color: '#555',
                        marginTop: 36,
                        textAlign: 'right',
                        fontStyle: 'italic',
                        fontFamily: 'serif',
                    }}>
                        — {content.law_citation}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
