import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleTitleHook: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    // +15 offset: để khung hình đầu tiên (dùng làm ảnh bìa/thumbnail) đã ở vị trí ổn định,
    // không bị lệch xuống dưới do hiệu ứng trượt lên vừa mới bắt đầu.
    const slideUp = spring({ frame: frame + 15, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ 
                fontSize: 80,
                color: '#FFFFFF', 
                fontWeight: 'bold',
                textAlign: 'center', 
                zIndex: 1, 
                textTransform: 'capitalize',
                padding: '0 80px', 
                // QUAN TRỌNG: opacity giữ nguyên = 1 (không mờ dần từ 0) để khung hình ĐẦU TIÊN
                // của video (thường được Facebook/YouTube dùng làm ảnh bìa/thumbnail trong danh
                // sách video) đã hiển thị rõ chữ tiêu đề ngay lập tức, không bị trong suốt.
                transform: `translateY(${interpolate(slideUp, [0, 1], [40, 0])}px)`,
                opacity: 1,
                lineHeight: 1.3,
                whiteSpace: 'pre-wrap'
            }}>
                {/* staggerDelay=0: tất cả các từ hiện cùng lúc, không tách lượt theo từng từ,
                    để khung hình đầu video (dùng làm ảnh bìa/thumbnail) đã đọc được trọn vẹn câu chữ */}
                <RichText text={content.headline || "Tiêu đề Tò mò"} staggerDelay={0} brandAccent={content.brand_accent} themeType="headline" />
            </h1>
        </AbsoluteFill>
    );
};
