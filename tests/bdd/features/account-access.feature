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
    And my offline copy is synchronized
    When I sign out
    Then I return to the public home page
    And my offline copy is removed

  Scenario: Keep the session when sign out fails
    Given I am signed in
    And my offline copy is synchronized
    When the sign-out request fails
    Then I remain signed in with an error
    And my offline copy remains

  Scenario: Request a password reset
    Given I have a confirmed account
    When I request a password reset
    Then a password reset email is captured locally

  Scenario: Reject a normal session on the recovery page
    Given I am signed in
    When I visit the password recovery page directly
    Then the replacement password form is unavailable

  @product-review
  Scenario: Reject mismatched replacement passwords
    Given I follow a valid password reset link
    When I enter two different replacement passwords
    Then I am told that the passwords do not match

  Scenario: Complete a password reset
    Given I follow a valid password reset link
    When I enter a valid replacement password
    Then I am told that my password was updated
    And only the replacement password signs me in
