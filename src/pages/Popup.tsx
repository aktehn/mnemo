/**
 * Popup Page
 * 
 * Entry point for the popup window.
 * Simply renders the VocabularyPopup component.
 * 
 * @module pages/Popup
 */

import { useState, useEffect } from 'react';
import VocabularyPopup from '../features/vocabulary/components/VocabularyPopup';
import QuickAddPopup from '../features/vocabulary/components/QuickAddPopup';

type PopupMode = 'review' | 'add';

const Popup = () => {
    const [mode, setMode] = useState<PopupMode>('review');

    useEffect(() => {
        if (window.electron?.onRefreshWord) {
            window.electron.onRefreshWord(() => {
                setMode('review');
            });
        }

        if (window.electron?.onOpenQuickAdd) {
            window.electron.onOpenQuickAdd(() => {
                setMode('add');
            });
        }
    }, []);

    return mode === 'add' ? <QuickAddPopup /> : <VocabularyPopup />;
};

export default Popup;
