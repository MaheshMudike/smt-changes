set folder=%1
rmdir /s /q ".\kone_smt_releases\www"
mkdir ".\kone_smt_releases\www"
xcopy  /k /y /e "www" ".\kone_smt_releases\www"
jar -cMf kone_smt_releases\%1.zip -C kone_smt_releases www
rmdir /s /q ".\kone_smt_releases\www"