if [ -d ".git/hooks" ]
then
  cp etc/pre-commit .git/hooks/
  chmod +x .git/hooks/pre-commit
else
  echo "Directory .git/hooks does not exists. Git hooks are NOT installed"
fi
