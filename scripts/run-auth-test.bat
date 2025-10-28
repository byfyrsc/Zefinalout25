@echo off
echo Executando testes de autenticacao...
cd c:\Saas_Ze
npm test -- -t "should handle authentication errors and not get stuck in loading state"
echo.
echo Se o teste passar, as correcoes foram bem-sucedidas.
echo Se o teste falhar, pode ser necessario fazer ajustes adicionais.
echo.
echo Para testar a aplicacao completa, execute: npm run dev
pause