import os
import zipfile

def zip_project(src_dir, dest_zip):
    excludes = ['node_modules', '.git', '.vs', 'bin', 'obj', 'build', '.gradle', '.idea']
    
    with zipfile.ZipFile(dest_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(src_dir):
            # In-place modify dirs to skip excluded directories
            dirs[:] = [d for d in dirs if d not in excludes]
            
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, start=src_dir)
                try:
                    zipf.write(file_path, arcname)
                except Exception as e:
                    print(f"Skipping {file_path}: {e}")

if __name__ == '__main__':
    src = r'C:\Users\evilh\logistica-amover'
    dest = r'C:\Users\evilh\A-MoVeR_Logistica_Final.zip'
    print("Zipping project...")
    zip_project(src, dest)
    print("Done!")
