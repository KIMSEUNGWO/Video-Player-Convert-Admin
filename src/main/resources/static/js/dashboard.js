// 전역 상태 관리
const state = {
    threads: [],
    selectedThreads: new Set()
};

// DOM 요소 참조
const DOM = {
    threadTable: document.getElementById('threadTable'),
    addThreadBtn: document.getElementById('addThreadBtn'),
    addThreadModal: document.getElementById('addThreadModal'),
    addThreadForm: document.getElementById('addThreadForm'),
    threadActionModal: document.getElementById('threadActionModal'),
    editThreadForm: document.getElementById('editThreadForm'),
    modalThreadName: document.getElementById('modalThreadName'),
    editThreadId: document.getElementById('editThreadId'),
    editThreadName: document.getElementById('editThreadName'),
    updateNameBtn: document.getElementById('updateNameBtn'),
    deleteThreadBtn: document.getElementById('deleteThreadBtn'),
    startThreadBtn: document.getElementById('startThreadBtn'),
    stopThreadBtn: document.getElementById('stopThreadBtn'),
    forceStopThreadBtn: document.getElementById('forceStopThreadBtn'),
    deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
    selectAll: document.getElementById('selectAll'),
    refreshBtn: document.getElementById('refreshBtn'),
    backdrop: document.querySelector('.backdrop'),
    closeBtns: document.querySelectorAll('.close-btn'),
    cancelBtns: document.querySelectorAll('.cancel-btn'),
    coreThreadsInput : document.getElementById('coreThreadsInput'),
    maxThreadsInput : document.getElementById('maxThreadsInput'),
    updateThreadsBtn : document.getElementById('updateThreadsBtn')
};


// API 경로 설정
const API = {
    getThreads: '/api/threads',
    addThread: '/api/threads',
    updateThread: (id) => `/api/threads/${id}`,
    deleteThread: (id) => `/api/threads/${id}`,
    startThread: (id) => `/api/threads/${id}/start`,
    stopThread: (id) => `/api/threads/${id}/stop`,
    forceStopThread: (id) => `/api/threads/${id}/force-stop`,
    getThreadStatus: (id) => `/api/threads/${id}/status`,
    updateThreadName: (id) => `/api/threads/${id}/name`,
    checkConnection: (serverUrl) => `/api/connect/check?url=${encodeURIComponent(serverUrl)}`,
    updateThreadCount : (id) => `/api/threads/${id}/threads`
};

// 초기화 함수
function init() {
    // 이벤트 리스너 등록
    attachEventListeners();
    attachThreadSettingsListeners();

    // 초기 데이터 로드
    fetchThreads();

    // 10초마다 자동 갱신
    setInterval(fetchThreads, 10000);
}

// 이벤트 리스너 등록
function attachEventListeners() {
    // 스레드 추가 버튼
    DOM.addThreadBtn.addEventListener('click', () => {
        showModal(DOM.addThreadModal);
    });

    // 스레드 추가 폼 제출
    DOM.addThreadForm.addEventListener('submit', handleAddThread);

    // 스레드 이름 수정
    DOM.updateNameBtn.addEventListener('click', handleUpdateThreadName);

    // 스레드 삭제
    DOM.deleteThreadBtn.addEventListener('click', handleDeleteThread);

    // 스레드 액션 버튼들
    document.querySelectorAll('.thread-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const threadId = DOM.editThreadId.value;
            handleThreadAction(threadId, action);
        });
    });

    // 선택 스레드 삭제
    DOM.deleteSelectedBtn.addEventListener('click', handleDeleteSelectedThreads);

    // 전체 선택 체크박스
    DOM.selectAll.addEventListener('change', handleSelectAll);

    // 새로고침 버튼
    DOM.refreshBtn.addEventListener('click', fetchThreads);

    // 모달 닫기 버튼들
    DOM.closeBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // 취소 버튼들
    DOM.cancelBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // 백드롭 클릭 시 모달 닫기
    DOM.backdrop.addEventListener('click', closeAllModals);
}

// 이벤트 리스너 추가
function attachThreadSettingsListeners() {
    // 스레드 수 업데이트 버튼
    DOM.updateThreadsBtn.addEventListener('click', handleUpdateCoreThreads);
}

// 스레드 목록 조회
function fetchThreads() {
    showLoading(true);

    fetch(API.getThreads)
        .then(res => {
            if (!res.ok) throw new Error('스레드 목록을 불러오는데 실패했습니다.');
            return res.json();
        }).then(json => {
            state.threads = json;

            // 테이블 렌더링
            renderThreadTable();

            // 로딩 상태 해제
            showLoading(false);
        }).catch(error => {
            showError(error.message);
            showLoading(false);
        })
}

// 스레드 테이블 렌더링
function renderThreadTable() {
    if (!state.threads.length) {
        DOM.threadTable.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">등록된 스레드가 없습니다.</td>
            </tr>
        `;
        return;
    }

    DOM.threadTable.innerHTML = state.threads.map((thread, index) => `
        <tr>
            <td>
                <input type="checkbox" class="thread-checkbox" data-id="${thread.id}" 
                       ${state.selectedThreads.has(thread.id) ? 'checked' : ''}>
            </td>
            <td>${index + 1}</td>
            <td>${thread.name}</td>
            <td>${thread.address}</td>
            <td>${thread.coreThreads}</td>
            <td>${thread.maxThreads}</td>
            <td>${thread.activeThreads}</td>
            <td>${thread.queuedThreads}</td>
            <td>
                <span class="status-badge status-${getStatusClass(thread.status)}">
                    ${getStatusText(thread.status)}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="openThreadActionModal(${thread.id})">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // 체크박스 이벤트 리스너 추가
    document.querySelectorAll('.thread-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleThreadCheckboxChange);
    });

    // 선택 상태 갱신
    updateSelectedStatus();
}

// 스레드 추가 처리
async function handleAddThread(e) {
    e.preventDefault();

    const formData = new FormData(DOM.addThreadForm);
    const threadData = {
        name: formData.get('threadName'),
        address: formData.get('serverAddress')
    };

        // 연결 확인
    checkConnection(threadData.address)
        .then(result => {
            if (!result) {
                showError('서버연결에 실패했습니다. URL을 확인해주세요.');
                return;
            }
            // 스레드 추가 API 호출
            fetch(API.addThread, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(threadData)
            }).then(response => {
                if (!response.ok) throw new Error('스레드 추가에 실패했습니다.');

                // 성공 시 모달 닫고 목록 갱신
                closeAllModals();
                DOM.addThreadForm.reset();
                showToast('스레드가 추가되었습니다.');
                fetchThreads();
            }).catch(error => showError(error.message));
        })
}

// 연결 확인
function checkConnection(serverUrl) {
    return fetch(API.checkConnection(serverUrl))
        .then(res => res.ok);
}

// 스레드 이름 수정
function handleUpdateThreadName() {
    const threadId = DOM.editThreadId.value;
    const newName = DOM.editThreadName.value.trim();

    if (!newName) {
        showError('스레드 이름을 입력해주세요.');
        return;
    }

    fetch(API.updateThreadName(threadId), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
    }).then(res => {
        if (!res.ok) throw new Error('이름 수정에 실패했습니다.');
        closeAllModals();
        showToast('스레드 이름이 변경되었습니다.');
        fetchThreads();
    }).catch(error => showError(error.message))
}

// 스레드 삭제
function handleDeleteThread() {
    const threadId = DOM.editThreadId.value;

    if (!confirm('정말 이 스레드를 삭제하시겠습니까?')) return;

    fetch(API.deleteThread(threadId), {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) throw new Error('스레드 삭제에 실패했습니다.');

        closeAllModals();
        showToast('스레드가 삭제되었습니다.');
        fetchThreads();
    }).catch(error => showError(error.message))
}

// 스레드 액션 처리 (시작/중지/강제중지)
function handleThreadAction(threadId, action) {
    let apiUrl;
    let actionText;

    switch (action) {
        case 'start':
            apiUrl = API.startThread(threadId);
            actionText = '시작';
            break;
        case 'stop':
            apiUrl = API.stopThread(threadId);
            actionText = '중지';
            break;
        case 'forceStop':
            apiUrl = API.forceStopThread(threadId);
            actionText = '강제 중지';
            break;
        default:
            return;
    }

    if (action !== 'start' && !confirm(`정말 이 스레드를 ${actionText}하시겠습니까?`)) return;

    fetch(apiUrl, {
        method: 'POST'
    }).then(res => {
        if (!res.ok) throw new Error(`스레드 ${actionText}에 실패했습니다.`);

        closeAllModals();
        showToast(`스레드가 ${actionText}되었습니다.`);
        fetchThreads();
    }).catch(error => showError(error.message));
}

// 선택된 스레드 삭제
async function handleDeleteSelectedThreads() {
    const selectedIds = Array.from(state.selectedThreads);
    if (!selectedIds.length) return;

    if (!confirm(`선택한 ${selectedIds.length}개의 스레드를 삭제하시겠습니까?`)) return;

    try {
        // 병렬로 삭제 요청 보내기
        const promises = selectedIds.map(id =>
            fetch(API.deleteThread(id), { method: 'DELETE' })
        );

        const results = await Promise.allSettled(promises);
        const failed = results.filter(r => r.status === 'rejected' || !r.value.ok).length;

        if (failed) {
            showError(`${failed}개의 스레드 삭제에 실패했습니다.`);
        } else {
            showToast('선택한 스레드가 모두 삭제되었습니다.');
        }

        // 선택 상태 초기화 및 목록 갱신
        state.selectedThreads.clear();
        fetchThreads();
    } catch (error) {
        showError('스레드 삭제 중 오류가 발생했습니다.');
    }
}

// 체크박스 변경 처리
function handleThreadCheckboxChange(e) {
    const threadId = e.target.dataset.id;

    if (e.target.checked) {
        state.selectedThreads.add(threadId);
    } else {
        state.selectedThreads.delete(threadId);
    }

    updateSelectedStatus();
}

// 전체 선택/해제 처리
function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.thread-checkbox');

    if (e.target.checked) {
        checkboxes.forEach(cb => {
            cb.checked = true;
            state.selectedThreads.add(cb.dataset.id);
        });
    } else {
        checkboxes.forEach(cb => {
            cb.checked = false;
            state.selectedThreads.delete(cb.dataset.id);
        });
    }

    updateSelectedStatus();
}

// 선택 상태 업데이트
function updateSelectedStatus() {
    const selectedCount = state.selectedThreads.size;
    DOM.deleteSelectedBtn.disabled = selectedCount === 0;

    if (DOM.deleteSelectedBtn.querySelector('i')) {
        DOM.deleteSelectedBtn.innerHTML = selectedCount ?
            `<i class="fas fa-trash"></i> 선택 삭제 (${selectedCount})` :
            `<i class="fas fa-trash"></i> 선택 삭제`;
    } else {
        DOM.deleteSelectedBtn.textContent = selectedCount ?
            `선택 삭제 (${selectedCount})` :
            '선택 삭제';
    }
}

// 상태 클래스 가져오기
function getStatusClass(status) {
    switch (status) {
        case 'RUNNING': return 'running';
        case 'STOPPING': return 'stopping';
        case 'STOPPED': return 'stopped';
        default: return 'disconnected';
    }
}

// 상태 텍스트 가져오기
function getStatusText(status) {
    switch (status) {
        case 'RUNNING': return '정상';
        case 'STOPPING': return '정지 중';
        case 'STOPPED': return '정지';
        default: return '연결 끊김';
    }
}

// 모달 표시
function showModal(modal) {
    if (!modal) return;
    modal.style.display = 'block';
    DOM.backdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 모든 모달 닫기
function closeAllModals() {
    DOM.addThreadModal.style.display = 'none';
    DOM.threadActionModal.style.display = 'none';
    DOM.backdrop.style.display = 'none';
    document.body.style.overflow = '';

    // 초기화
    DOM.editThreadName.disabled = false;
    DOM.updateNameBtn.disabled = false;
    DOM.coreThreadsInput.disabled = false;
    DOM.maxThreadsInput.disabled = false;
    DOM.updateThreadsBtn.disabled = false;
}

// 로딩 상태 표시
function showLoading(show) {
    // 로딩 인디케이터 구현
    const loadingEl = document.querySelector('.loading-indicator');
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// 오류 메시지 표시
function showError(message) {
    // 오류 토스트 표시
    showToast(message, 'error');
}

// 토스트 메시지 표시
function showToast(message, type = 'success') {
    // 이미 있는 토스트 제거
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());

    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // 애니메이션 적용
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 3초 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// 스레드 액션 모달 열기 함수 수정
function openThreadActionModal(threadId) {
    const thread = state.threads.find(t => t.id === threadId);
    if (!thread) return;

    // 모달 데이터 설정
    DOM.modalThreadName.textContent = thread.name;
    DOM.editThreadId.value = threadId;
    DOM.editThreadName.value = thread.name;

    // 스레드 설정 값 설정
    DOM.coreThreadsInput.value = thread.coreThreads || 1;
    DOM.maxThreadsInput.value = thread.maxThreads || 10;

    // 상태에 따른 버튼 및 설정 요소 활성화/비활성화
    const isRunningOrStopped = thread.status === 'RUNNING' || thread.status === 'STOPPED';
    const settingsEnabled = isRunningOrStopped;

    // 설정 필드 활성화/비활성화
    DOM.coreThreadsInput.disabled = !settingsEnabled;
    DOM.maxThreadsInput.disabled = !settingsEnabled;
    DOM.updateThreadsBtn.disabled = !settingsEnabled;

    // 상태에 따른 버튼 표시/숨김
    if (thread.status === 'RUNNING') {
        DOM.startThreadBtn.style.display = 'none';
        DOM.stopThreadBtn.style.display = 'inline-flex';
        DOM.forceStopThreadBtn.style.display = 'inline-flex';
    } else if (thread.status === 'STOPPED') {
        DOM.startThreadBtn.style.display = 'inline-flex';
        DOM.stopThreadBtn.style.display = 'none';
        DOM.forceStopThreadBtn.style.display = 'none';
    } else if (thread.status === 'STOPPING') {
        DOM.startThreadBtn.style.display = 'none';
        DOM.stopThreadBtn.style.display = 'none';
        DOM.forceStopThreadBtn.style.display = 'inline-flex';
        DOM.editThreadName.disabled = true;
        DOM.updateNameBtn.disabled = true;
    } else {
        // 연결 끊김
        DOM.startThreadBtn.style.display = 'none';
        DOM.stopThreadBtn.style.display = 'none';
        DOM.forceStopThreadBtn.style.display = 'none';
    }

    // 모달 표시
    showModal(DOM.threadActionModal);
}

// 스레드 수 업데이트 처리
function handleUpdateCoreThreads() {
    const threadId = DOM.editThreadId.value;
    const coreThreads = parseInt(DOM.coreThreadsInput.value);
    const maxThreads = parseInt(DOM.maxThreadsInput.value);

    if ((isNaN(coreThreads) || coreThreads < 1) || isNaN(maxThreads) || maxThreads < 1) {
        showError('유효한 코어 스레드 수를 입력해주세요.');
        return;
    }

    if (coreThreads > maxThreads) {
        showError('코어 스레드 수는 최대 스레드 수보다 클 수 없습니다.');
        return;
    }

    if (maxThreads < coreThreads) {
        showError('최대 스레드 수는 코어 스레드 수보다 작을 수 없습니다.');
        return;
    }

    fetch(API.updateThreadCount(threadId), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coreThreads: coreThreads,
            maxThreads: maxThreads
        })
    }).then(res => {
        if (!res.ok) throw new Error('코어 스레드 수 변경에 실패했습니다.');

        showToast('스레드 수가 변경되었습니다.');
        fetchThreads();
    }).catch(error => showError(error.message));
}


// 스레드 액션 모달 열기를 위한 전역 함수 (onclick 속성에서 호출용)
window.openThreadActionModal = openThreadActionModal;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);