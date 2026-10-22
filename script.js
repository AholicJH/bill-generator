// 随机基础数据池
const FIRST_NAMES = ["张", "王", "李", "赵", "陈", "刘", "杨", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "郭"];
const LAST_NAMES = ["秋兰", "建国", "晓明", "明轩", "秀英", "海燕", "浩然", "嘉欣", "文博", "子涵", "宇轩", "晨曦", "俊杰", "雅文"];
const BANKS = ["中信银行", "招商银行", "中国工商银行", "中国建设银行", "中国农业银行", "交通银行", "浦发银行", "民生银行", "平安银行"];
const EMAIL_SUFFIXES = ["@163.com", "@qq.com", "@gmail.com", "@126.com", "@foxmail.com"];

// 工具函数：生成指定长度的纯数字字符串
function randomDigits(length) {
  let res = "";
  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 10).toString();
  }
  return res;
}

// 工具函数：金额千分位格式化
function formatCurrency(amount) {
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// 获取所有 DOM 节点
const dom = {
  randomBtn: document.getElementById("randomBtn"),
  saveImageBtn: document.getElementById("saveImageBtn"),
  // 输入表单
  inputName: document.getElementById("inputName"),
  inputAmount: document.getElementById("inputAmount"),
  inputBank: document.getElementById("inputBank"),
  inputCardTail: document.getElementById("inputCardTail"),
  inputAccount: document.getElementById("inputAccount"),
  inputTime: document.getElementById("inputTime"),
  inputOrderId: document.getElementById("inputOrderId"),
  // 手机端展示
  statusTime: document.getElementById("statusTime"),
  displayPayerName: document.getElementById("displayPayerName"),
  displayAmount: document.getElementById("displayAmount"),
  displayBankInfo: document.getElementById("displayBankInfo"),
  displayAccount: document.getElementById("displayAccount"),
  displayTime: document.getElementById("displayTime"),
  displayOrderId: document.getElementById("displayOrderId")
};

// 执行随机生成逻辑
function generateRandomBill() {
  const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const fullName = fName + lName;

  // 随机金额：1,000 ~ 500,000
  const randomAmount = (Math.floor(Math.random() * 4990 + 10) * 100).toFixed(2);

  // 银行与尾号
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
  const cardTail = randomDigits(4);

  // 脱敏邮箱账户
  const pinyinPrefix = "Du" + Math.floor(Math.random() * 9 + 1);
  const emailSuffix = EMAIL_SUFFIXES[Math.floor(Math.random() * EMAIL_SUFFIXES.length)];
  const accountStr = `${fullName} ${pinyinPrefix}***${emailSuffix}`;

  // 时间生成（在当前月份或指定时间点）
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  
  const timeFormatted = `${year}-${month}-${day} ${hours}:${minutes}`;
  const timeCompact = `${year}${month}${day}`;

  // 微信/支付宝标准的 32 位数字长订单号格式
  const orderId = `${timeCompact}00000000${randomDigits(16)}`;

  // 同步到表单
  dom.inputName.value = fullName;
  dom.inputAmount.value = randomAmount;
  dom.inputBank.value = bank;
  dom.inputCardTail.value = cardTail;
  dom.inputAccount.value = accountStr;
  dom.inputTime.value = timeFormatted;
  dom.inputOrderId.value = orderId;

  // 渲染视图
  render();
}

// 渲染视图函数
function render() {
  dom.displayPayerName.innerText = dom.inputName.value;
  dom.displayAmount.innerText = `+${formatCurrency(dom.inputAmount.value || 0)}`;
  dom.displayBankInfo.innerText = `${dom.inputBank.value}(${dom.inputCardTail.value})`;
  dom.displayAccount.innerText = dom.inputAccount.value;
  dom.displayTime.innerText = dom.inputTime.value;
  dom.displayOrderId.innerText = dom.inputOrderId.value;

  // 同步顶部状态栏时间（提取时分）
  const timeParts = dom.inputTime.value.split(" ");
  if (timeParts.length > 1) {
    dom.statusTime.innerText = timeParts[1];
  }
}

// 绑定事件
dom.randomBtn.addEventListener("click", generateRandomBill);

// 将手机预览保存为 PNG 图片
dom.saveImageBtn.addEventListener("click", async () => {
  if (typeof html2canvas !== "function") {
    dom.saveImageBtn.textContent = "图片工具加载失败";
    return;
  }

  const originalText = dom.saveImageBtn.innerHTML;
  dom.saveImageBtn.disabled = true;
  dom.saveImageBtn.textContent = "正在生成图片...";

  try {
    const canvas = await html2canvas(document.querySelector(".phone-screen"), {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false
    });
    const name = dom.inputName.value.trim() || "账单详情";
    const fileName = `${name}-账单.png`;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    const imageUrl = URL.createObjectURL(blob);
    const isMobile = window.matchMedia("(max-width: 760px)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // 手机浏览器直接展示原图，用户可长按选择“存储到照片/保存到相册”。
      const preview = document.createElement("a");
      preview.href = imageUrl;
      preview.target = "_blank";
      preview.rel = "noopener";
      preview.click();
      dom.saveImageBtn.textContent = "请长按图片保存到相册";
      setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
    } else {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = imageUrl;
      link.click();
      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      dom.saveImageBtn.textContent = "已下载账单图片";
    }

    setTimeout(() => {
      dom.saveImageBtn.innerHTML = originalText;
      dom.saveImageBtn.disabled = false;
    }, 1600);
  } catch (error) {
    console.error("保存账单图片失败", error);
    dom.saveImageBtn.textContent = "保存失败，请重试";
    setTimeout(() => {
      dom.saveImageBtn.innerHTML = originalText;
      dom.saveImageBtn.disabled = false;
    }, 1600);
  }
});

// 输入框实时响应联动
[
  dom.inputName,
  dom.inputAmount,
  dom.inputBank,
  dom.inputCardTail,
  dom.inputAccount,
  dom.inputTime,
  dom.inputOrderId
].forEach(input => {
  input.addEventListener("input", render);
});

// 初始化首屏
generateRandomBill();