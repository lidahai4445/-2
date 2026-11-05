// 基础全局变量安全初始化（防止浏览器缓存旧版脚本时出现 undefined 报错）
window.SUBJECTS = window.SUBJECTS || [];
window.CHAPTERS = window.CHAPTERS || [];
window.QUESTIONS = window.QUESTIONS || [];
window.CALC_GENERATORS = window.CALC_GENERATORS || {};
