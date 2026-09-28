@echo off
REM ServLink local Postgres 17 — double-click to start. Leave the window open while developing.
set BIN=%LOCALAPPDATA%\Programs\pgsql17\pgsql\bin
set DATA=%LOCALAPPDATA%\Programs\pgsql17\data
"%BIN%\pg_ctl.exe" -D "%DATA%" -l "%LOCALAPPDATA%\Programs\pgsql17\log.txt" start
echo.
echo If you see "server started", Postgres is on localhost:5432 (user postgres, db servlink after first createdb).
pause
