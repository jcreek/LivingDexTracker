Feature: Account access
  As a trainer
  I want secure access to my account
  So that only I can update my collection

  Scenario: Register a new account
    Given I am a new visitor
    When I register with valid account details
    Then I am told to confirm my email
    And a confirmation email is captured locally

  Scenario: Sign in with valid credentials
    Given I have a confirmed account
    When I sign in with my credentials
    Then I arrive at my Pokédex list

  Scenario: Reject invalid credentials
    Given I have a confirmed account
    When I sign in with an incorrect password
    Then I see a sign-in error

  Scenario: Redirect an authenticated visitor
    Given I am signed in
    When I visit the public home page
    Then I arrive at my Pokédex list

  Scenario: Sign out
    Given I am signed in
    When I sign out
    Then I return to the public home page

  Scenario: Request a password reset
    Given I have a confirmed account
    When I request a password reset
    Then a password reset email is captured locally

  @product-review
  Scenario: Reject mismatched replacement passwords
    Given I am on the password reset page with a recovery session
    When I enter two different replacement passwords
    Then I am told that the passwords do not match

  Scenario: Complete a password reset
    Given I am on the password reset page with a recovery session
    When I enter a valid replacement password
    Then I am told that my password was updated

