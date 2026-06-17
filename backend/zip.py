import os
import zipfile

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

if __name__ == '__main__':
    zipf = zipfile.ZipFile('backend_v3.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('package', zipf)
    zipf.write('app.py', 'app.py')
    zipf.close()
    print("Zipped successfully!")
