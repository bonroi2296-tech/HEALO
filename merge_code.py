import os

# 합칠 파일들의 확장자 (필요하면 추가)
EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx', '.css', '.json'}
# 무시할 폴더 및 파일
IGNORE_DIRS = {'node_modules', '.git', 'dist', 'build', '.vscode'}
IGNORE_FILES = {'package-lock.json', 'yarn.lock'}

output_file = 'healo_project_context.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    # 프로젝트 구조 먼저 요약해서 적기
    outfile.write("=== PROJECT FILE STRUCTURE ===\n")
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            if file not in IGNORE_FILES:
                 outfile.write(f"{os.path.join(root, file)}\n")
    outfile.write("\n\n=== FILE CONTENTS ===\n\n")

    # 실제 파일 내용 적기
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            if file in IGNORE_FILES: continue
            
            ext = os.path.splitext(file)[1]
            if ext in EXTENSIONS:
                file_path = os.path.join(root, file)
                outfile.write(f"\n\n--- START OF FILE: {file_path} ---\n")
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"Error reading file: {e}")
                outfile.write(f"\n--- END OF FILE: {file_path} ---\n")

print(f"✅ 완료! '{output_file}' 파일이 생성되었습니다. 이 파일을 AI에게 업로드하세요.")