import os
import zipfile

zip_path = r'd:\IQRA UNI\Elective\Cloud-Project-Fixed-Backup.zip'
root_dir = r'd:\IQRA UNI\Elective\Cloud'
exclude_dirs = {'node_modules', 'package', '__pycache__', '.git', '.vscode', '.idea'}
exclude_files = {'deployment_package.zip', 'zip_script.py'}

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to prune the traversal
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file not in exclude_files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_dir)
                zf.write(file_path, rel_path)

print("Fixed zip created successfully!")
