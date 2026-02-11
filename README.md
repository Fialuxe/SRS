The mock system for the lecture: Software Engineering held in UEC(on 2025)

# How to Contribute (One Example — Other Ways Welcome)
---

## 🇯🇵 日本語版

### 1. リポジトリを Fork する

1. 以下のリポジトリを開きます。

   [https://github.com/fialuxe/SRS](https://github.com/fialuxe/SRS)
2. 画面右上の **Fork** ボタンをクリックします。
3. 自分の GitHub アカウントにリポジトリがコピーされます。

---

### 2. Fork したリポジトリを Clone する

1. ターミナルを開きます。
2. 作業用ディレクトリに移動します。

   ```bash
   cd YourName/Documents/Github/
   ```
3. 自分の fork したリポジトリを clone します。

   ```bash
   git clone https://github.com/<your-github-username>/SRS.git
   ```
4. プロジェクトディレクトリに移動します。

   ```bash
   cd SRS
   ```

---

### 3. ブランチを作成する

作業は必ず新しいブランチで行ってください。

```bash
git checkout -b feature/your-branch-name
```

例:

```bash
git checkout -b feature/update-readme
```

---

### 4. ファイルを編集する

1. IDE やエディタでプロジェクトを開きます。
2. ファイルを編集し、保存します。

---

### 5. 変更を Commit する

1. 変更内容をステージします。

   ```bash
   git add .
   ```
2. コミットメッセージを付けてコミットします。

   ```bash
   git commit -m "変更内容を簡潔に書く"
   ```

---

### 6. ブランチを Push する

```bash
git push origin feature/your-branch-name
```

---

### 7. Pull Request を作成する

1. GitHub で自分の fork したリポジトリを開きます。
2. 表示される **Compare & pull request** をクリックします。
3. 以下を確認します。

   * Base repository: `fialuxe/SRS`
   * Base branch: `main`
4. 内容を記入し、**Create Pull Request** をクリックします。

---

## 🇺🇸 English Version

### 1. Fork the Repository

1. Open the repository:

   [https://github.com/fialuxe/SRS](https://github.com/fialuxe/SRS)
2. Click the **Fork** button in the top-right corner.
3. A copy of the repository will be created in your GitHub account.

---

### 2. Clone Your Forked Repository

1. Open the Terminal.
2. Move to your working directory:

   ```bash
   cd YourName/Documents/Github/
   ```
3. Clone your forked repository:

   ```bash
   git clone https://github.com/<your-github-username>/SRS.git
   ```
4. Move into the project directory:

   ```bash
   cd SRS
   ```

---

### 3. Create a New Branch

Always create a new branch before making changes.

```bash
git checkout -b feature/your-branch-name
```

Example:

```bash
git checkout -b feature/update-readme
```

---

### 4. Edit the Files

1. Open the project using your IDE or editor.
2. Make your changes and save the files.

---

### 5. Commit Your Changes

1. Stage the changes:

   ```bash
   git add .
   ```
2. Commit with a message:

   ```bash
   git commit -m "Describe what you changed"
   ```

---

### 6. Push the Branch

```bash
git push origin feature/your-branch-name
```

---

### 7. Create a Pull Request

1. Go to your forked repository on GitHub.
2. Click **Compare & pull request**.
3. Make sure:

   * Base repository: `fialuxe/SRS`
   * Base branch: `main`
4. Write a short description and click **Create Pull Request**.

---

✅ Done! If you followed these steps, your Pull Request was created successfully.
