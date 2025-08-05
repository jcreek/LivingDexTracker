Feature: User Authentication
  As a Pokémon trainer
  I want to sign in and manage my account
  So that I can track my Living Dex progress

  Background:
    Given the application is running on the local development server

  @public
  Scenario: User can access the sign-in page
    When I navigate to the sign-in page
    Then I should see the sign-in form
    And I should see an email input field
    And I should see a password input field
    And I should see a "Sign In" button

  @public
  Scenario: User can sign up for a new account
    Given I am on the sign-in page
    When I click the "Sign Up" tab
    Then I should see the sign-up form
    And I should see a "Create Account" button

  @public
  Scenario: User can navigate between sign-in and sign-up
    Given I am on the sign-in page
    When I click the "Sign Up" tab
    Then I should see the sign-up form
    When I click the "Sign In" tab
    Then I should see the sign-in form

  @public
  Scenario: User sees proper validation messages
    Given I am on the sign-in page
    When I click the "Sign In" button without entering credentials
    Then I should see validation error messages

  @public
  Scenario: User can access the application without authentication
    When I navigate to the home page
    Then I should see the home page content
    And I should see a "Sign In" link in the navigation

  @public
  Scenario: User can navigate to different pages from home
    Given I am on the home page
    When I click the "About" link
    Then I should be on the about page
    And I should see information about the Living Dex Tracker

  Scenario: User can successfully authenticate and access protected features
    Given I am on the sign-in page 
    When I enter valid test credentials
    And I click the "Sign In" button
    Then I should be redirected to the pokédexes page
    And I should see my pokédex dashboard
    And I should see user-specific navigation options