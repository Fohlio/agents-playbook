# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - link [ref=e8] [cursor=pointer]:
      - /url: https://www.fohlio.com
  - generic [ref=e10]:
    - generic [ref=e11]:
      - heading "Sign In" [level=2] [ref=e13]
      - heading "Welcome back! Please enter your details." [level=2] [ref=e14]
    - generic [ref=e15]:
      - generic [ref=e17]:
        - generic "Email" [ref=e19]: Email *
        - textbox "Email *" [active] [ref=e23]:
          - /placeholder: Enter your email...
          - text: test@agents-playbook.com
      - generic [ref=e25]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: Password
            - link "Forgot your password?" [ref=e30] [cursor=pointer]:
              - /url: /password/new
          - text: "*"
        - generic [ref=e34]:
          - textbox "Password Forgot your password? *" [ref=e35]:
            - /placeholder: Enter you password...
          - img "eye-invisible" [ref=e37] [cursor=pointer]:
            - img [ref=e38]
      - button "Login" [ref=e44] [cursor=pointer]:
        - generic [ref=e45]: Login
```