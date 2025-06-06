// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // トランプカードの配列
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    let selectedCardIndex = null;
    let selectedSuit = null;
    let selectedValue = null;
    
    // チップ管理の状態
    let pot = 0;
    let stack = 1000;
    let bet = 0;
    
    // カードを初期化する関数
    function initializeCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.add('flipped'); // 最初は裏面を表示
            card.setAttribute('data-suit', '');
            card.setAttribute('data-value', '');
        });
    }
    
    // モーダルを表示する関数
    function showModal() {
        document.getElementById('cardSelectionModal').classList.remove('hidden');
    }
    
    // モーダルを非表示にする関数
    function hideModal() {
        document.getElementById('cardSelectionModal').classList.add('hidden');
    }
    
    // カードをクリックしたときの処理
    function handleCardClick(event) {
        const card = event.currentTarget;
        selectedCardIndex = parseInt(card.dataset.cardIndex);
        
        // 他のカードの選択を解除
        document.querySelectorAll('.card').forEach(c => {
            if (c !== card) {
                c.classList.remove('selected');
            }
        });
        
        // 選択されたカードを強調表示
        card.classList.add('selected');
        
        // モーダルを表示
        showModal();
        
        // スートとバリューの選択をリセット
        resetSelections();
    }
    
    // スートを選択したときの処理
    function handleSuitClick(event) {
        const suitBtn = event.currentTarget;
        selectedSuit = suitBtn.dataset.suit;
        
        // 他のスートボタンの選択を解除
        document.querySelectorAll('.suit-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 選択されたスートボタンを強調表示
        suitBtn.classList.add('selected');
    }
    
    // バリューを選択したときの処理
    function handleValueClick(event) {
        const valueBtn = event.currentTarget;
        selectedValue = valueBtn.dataset.value;
        
        // 他のバリューボタンの選択を解除
        document.querySelectorAll('.value-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 選択されたバリューボタンを強調表示
        valueBtn.classList.add('selected');
    }
    
    // 選択をリセットする関数
    function resetSelections() {
        selectedSuit = null;
        selectedValue = null;
        document.querySelectorAll('.suit-btn, .value-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    // 選択されたカードを更新する関数
    function updateSelectedCard() {
        const selectedCard = document.querySelector('.selected-card');
        if (selectedCard) {
            const suit = selectedCard.getAttribute('data-suit');
            const value = selectedCard.getAttribute('data-value');
            updateCardImage(selectedCard, suit, value);
        }
        updateCurrentHand();
    }
    
    // イベントリスナーを設定
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', handleCardClick);
    });
    
    document.querySelectorAll('.suit-btn').forEach(btn => {
        btn.addEventListener('click', handleSuitClick);
    });
    
    document.querySelectorAll('.value-btn').forEach(btn => {
        btn.addEventListener('click', handleValueClick);
    });
    
    // モーダルの閉じるボタンのイベントリスナー
    document.querySelector('.close-btn').addEventListener('click', () => {
        hideModal();
        resetSelections();
    });
    
    // 確定ボタンのイベントリスナー
    document.querySelector('.confirm-btn').addEventListener('click', () => {
        if (selectedSuit && selectedValue && selectedCardIndex !== null) {
            const card = document.querySelector(`[data-card-index="${selectedCardIndex}"]`);
            card.setAttribute('data-suit', selectedSuit);
            card.setAttribute('data-value', selectedValue);
            updateCardImage(card, selectedSuit, selectedValue);
            
            // カードを表に返す
            card.classList.remove('flipped');
            
            // モーダルを非表示にする
            hideModal();
            
            // 選択状態をリセット
            card.classList.remove('selected');
            selectedCardIndex = null;
            
            // 現在のハンドを更新
            updateCurrentHand();
        }
    });
    
    // リセットボタンのイベントリスナー
    document.querySelector('.reset-btn').addEventListener('click', () => {
        resetSelections();
        if (selectedCardIndex !== null) {
            const card = document.querySelector(`[data-card-index="${selectedCardIndex}"]`);
            card.classList.add('flipped');
            card.classList.remove('selected');
            card.setAttribute('data-suit', '');
            card.setAttribute('data-value', '');
            selectedCardIndex = null;
        }
        hideModal();
    });
    
    // チップ管理の初期化
    function initializeChips() {
        updateChipsDisplay();
        setupChipsEventListeners();
    }
    
    // チップ表示の更新
    function updateChipsDisplay() {
        document.querySelector('.pot-amount').textContent = `$${pot}`;
        document.querySelector('.stack-amount').textContent = `$${stack}`;
        document.querySelector('.bet-amount').textContent = `$${bet}`;
    }
    
    // チップ管理のイベントリスナー設定
    function setupChipsEventListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const container = e.target.closest('.pot-container, .stack-container, .bet-container');
                if (!container) return;
                
                const fieldName = container.classList.contains('pot-container') ? 'pot' :
                                container.classList.contains('stack-container') ? 'stack' : 'bet';
                const currentValue = fieldName === 'pot' ? pot :
                                   fieldName === 'stack' ? stack : bet;
                
                const newValue = prompt(`Enter new ${fieldName} value:`, currentValue);
                if (newValue !== null) {
                    const value = parseInt(newValue);
                    if (!isNaN(value) && value >= 0) {
                        switch (fieldName) {
                            case 'pot':
                                pot = value;
                                break;
                            case 'stack':
                                stack = value;
                                break;
                            case 'bet':
                                const oldBet = bet;
                                bet = value;
                                
                                // betの増減分をstackから引く/足す
                                const betDifference = bet - oldBet;
                                stack -= betDifference;
                                
                                // stackが0未満にならないようにする
                                if (stack < 0) {
                                    stack = 0;
                                    bet = oldBet + (stack - oldBet);
                                }
                                break;
                        }
                        updateChipsDisplay();
                    }
                }
            });
        });

        // Add to Potボタンのイベントリスナー
        const addToPotButton = document.querySelector('.action-btn');
        if (addToPotButton) {
            addToPotButton.addEventListener('click', () => {
                if (bet > 0) {
                    pot += bet;
                    bet = 0;
                    updateChipsDisplay();
                }
            });
        }

        // Winボタンのイベントリスナー
        const winButton = document.querySelector('.win-btn');
        if (winButton) {
            winButton.addEventListener('click', () => {
                stack += pot + bet;
                pot = 0;
                bet = 0;
                updateChipsDisplay();
            });
        }

        // Loseボタンのイベントリスナー
        const loseButton = document.querySelector('.lose-btn');
        if (loseButton) {
            loseButton.addEventListener('click', () => {
                pot = 0;
                bet = 0;
                updateChipsDisplay();
            });
        }
    }
    
    // 初期化
    initializeCards();
    initializeChips();

    // Hole Cards Bottom Sheet functionality
    const holeCardsBtn = document.querySelector('.hole-cards-btn');
    const holeCardsSheet = document.getElementById('holeCardsSheet');
    const closeHoleCardsBtn = document.querySelector('#holeCardsSheet .close-btn');
    const closeSheetBtn = document.querySelector('.close-sheet-btn');

    holeCardsBtn.addEventListener('click', () => {
        holeCardsSheet.classList.remove('hidden');
        setTimeout(() => {
            holeCardsSheet.classList.add('show');
        }, 10);
    });

    closeHoleCardsBtn.addEventListener('click', () => {
        holeCardsSheet.classList.remove('show');
        setTimeout(() => {
            holeCardsSheet.classList.add('hidden');
        }, 300);
    });

    closeSheetBtn.addEventListener('click', () => {
        holeCardsSheet.classList.remove('show');
        setTimeout(() => {
            holeCardsSheet.classList.add('hidden');
        }, 300);
    });

    // Close bottom sheet when clicking outside
    document.addEventListener('click', (e) => {
        if (!holeCardsSheet.contains(e.target) && 
            e.target !== holeCardsBtn && 
            !e.target.closest('#cardSelectionModal')) {
            holeCardsSheet.classList.remove('show');
            setTimeout(() => {
                holeCardsSheet.classList.add('hidden');
            }, 300);
        }
    });

    // ポーカーハンドの確率計算
    function calculateHandProbabilities() {
        const visibleCards = Array.from(document.querySelectorAll('.card:not(.flipped)')).map(card => {
            const cardText = card.querySelector('.card-front').textContent;
            return {
                suit: cardText.slice(-1),
                value: cardText.slice(0, -1)
            };
        });

        if (visibleCards.length < 2) return; // ホールカードが2枚未満の場合は計算しない

        const remainingCards = getRemainingCards(visibleCards);
        const probabilities = calculateProbabilities(visibleCards, remainingCards);
        updateProbabilityDisplay(probabilities);
    }

    // 残りのカードを取得
    function getRemainingCards(visibleCards) {
        const allCards = [];
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

        for (const suit of suits) {
            for (const value of values) {
                if (!visibleCards.some(card => card.suit === suit && card.value === value)) {
                    allCards.push({ suit, value });
                }
            }
        }

        return allCards;
    }

    // ハンドを評価
    function evaluateHand(cards) {
        const values = cards.map(card => card.value);
        const suits = cards.map(card => card.suit);
        
        // ペアの数をカウント
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        // 各役の判定用の変数
        const pairs = Object.values(valueCounts).filter(count => count === 2).length;
        const threeOfAKind = Object.values(valueCounts).some(count => count === 3);
        const fourOfAKind = Object.values(valueCounts).some(count => count === 4);
        
        // フラッシュのチェック
        const isFlush = suits.every(suit => suit === suits[0]);
        
        // ストレートのチェック
        const valueOrder = {
            'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, 
            '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
        };
        
        const numericValues = values.map(v => valueOrder[v]).sort((a, b) => a - b);
        
        // エースを1としても扱う（A-2-3-4-5のストレート用）
        if (numericValues.includes(14)) {
            numericValues.push(1);
        }
        
        let isStraight = false;
        for (let i = 0; i <= numericValues.length - 5; i++) {
            if (numericValues[i+4] - numericValues[i] === 4) {
                isStraight = true;
                break;
            }
        }
        
        // 役の判定（強い順）
        if (isFlush && isStraight) {
            // ロイヤルフラッシュのチェック
            if (numericValues.includes(14) && numericValues.includes(13) && 
                numericValues.includes(12) && numericValues.includes(11) && 
                numericValues.includes(10)) {
                return 'Royal Flush';
            }
            return 'Straight Flush';
        }
        
        if (fourOfAKind) return 'Four of a Kind';
        if (threeOfAKind && pairs === 1) return 'Full House';
        if (isFlush) return 'Flush';
        if (isStraight) return 'Straight';
        if (threeOfAKind) return 'Three of a Kind';
        if (pairs === 2) return 'Two Pair';
        if (pairs === 1) return 'One Pair';
        return 'High Card';
    }

    // 各役の確率を計算
    function calculateProbabilities(visibleCards, remainingCards) {
        const totalCombinations = 50000; // シミュレーション回数を増やす
        const results = {
            'Royal Flush': 0,
            'Straight Flush': 0,
            'Four of a Kind': 0,
            'Full House': 0,
            'Flush': 0,
            'Straight': 0,
            'Three of a Kind': 0,
            'Two Pair': 0,
            'One Pair': 0,
            'High Card': 0
        };

        for (let i = 0; i < totalCombinations; i++) {
            const communityCards = shuffleArray(remainingCards).slice(0, 5 - visibleCards.length);
            const allCards = [...visibleCards, ...communityCards];
            const handRank = evaluateHand(allCards);
            results[handRank]++;
        }

        // 確率をパーセンテージに変換
        for (const hand in results) {
            results[hand] = (results[hand] / totalCombinations * 100).toFixed(2);
        }

        // 確率表示を更新
        updateProbabilityDisplay(results);

        return results;
    }

    // 配列をシャッフル
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // 確率表示を更新
    function updateProbabilityDisplay(probabilities) {
        Object.entries(probabilities).forEach(([hand, probability]) => {
            const rows = document.querySelectorAll('.ranking-row');
            for (const row of rows) {
                const handName = row.querySelector('.hand-name').textContent;
                if (handName === hand) {
                    row.querySelector('.hand-probability').textContent = `${probability}%`;
                    break;
                }
            }
        });
    }

    // 現在のハンドを評価して表示
    function updateCurrentHand() {
        const visibleCards = Array.from(document.querySelectorAll('.card:not(.flipped)')).map(card => {
            const suit = card.getAttribute('data-suit');
            const value = card.getAttribute('data-value');
            return { suit, value };
        });

        if (visibleCards.length < 2) {
            const handTypeElement = document.querySelector('.hand-type');
            handTypeElement.textContent = 'No Hand';
            return;
        }

        const remainingCards = getRemainingCards(visibleCards);
        const probabilities = calculateProbabilities(visibleCards, remainingCards);
        
        // 最も確率の高い役を取得
        const bestHand = Object.entries(probabilities)
            .reduce((best, [hand, prob]) => {
                return parseFloat(prob) > parseFloat(best[1]) ? [hand, prob] : best;
            }, ['No Hand', '0.00']);

        const handTypeElement = document.querySelector('.hand-type');
        handTypeElement.textContent = `${bestHand[0]} (${bestHand[1]}%)`;
    }

    // 初期確率計算と現在のハンド評価
    calculateHandProbabilities();
    updateCurrentHand();

    function createCard() {
        const card = document.createElement('div');
        card.className = 'card';
        
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        return card;
    }

    function updateCardImage(card, suit, value) {
        const cardFront = card.querySelector('.card-front');
        const suitMap = {
            '♠': 's',
            '♥': 'h',
            '♦': 'd',
            '♣': 'c'
        };
        const valueMap = {
            'A': '1',
            'J': '11',
            'Q': '12',
            'K': '13'
        };
        
        const suitCode = suitMap[suit];
        const valueCode = valueMap[value] || value;
        const imagePath = `card/${suitCode}${valueCode}.png`;
        
        // 画像のみを使用するように設定
        cardFront.style.backgroundImage = `url('${imagePath}')`;
        cardFront.style.backgroundSize = 'contain';
        cardFront.style.backgroundPosition = 'center';
        cardFront.style.backgroundRepeat = 'no-repeat';
        cardFront.style.backgroundColor = 'white';
    }
}); 