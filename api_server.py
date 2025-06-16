# api_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS  # <--- 1. 導入 CORS
import ddddocr
import base64

# 初始化 Flask 應用
app = Flask(__name__)
CORS(app)  # <--- 2. 將 CORS 應用到你的 app 上

# 初始化 ddddocr
# show_ad=False 可以關閉啟動時的廣告訊息
ocr = ddddocr.DdddOcr(show_ad=False) 

@app.route('/solve', methods=['POST'])
def solve_captcha():
    # 檢查請求中是否包含 JSON 數據
    if not request.json or 'image_base64' not in request.json:
        return jsonify({'error': 'Missing image_base64 in request body'}), 400

    image_base64 = request.json['image_base64']

    try:
        image_bytes = base64.b64decode(image_base64)
        result = ocr.classification(image_bytes)
    
        print(f"接收到請求，識別結果: {result}")
        return jsonify({'result': result})

    except Exception as e:
        print(f"處理請求時發生錯誤: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 讓伺服器在本地的 9988 端口上運行
    # host='0.0.0.0' 允許來自任何 IP 的訪問，包括你的擴充功能
    app.run(host='0.0.0.0', port=9988)